/**
 * WhatsApp Controller
 * UI 6  – Inbox thread view
 * UI 10/11/12 – Automation reminder flows
 * FR4   – WhatsApp opt-in & delivery
 * FR5   – Two-way WhatsApp messaging
 * FR12  – Auto document-collection reminders
 *
 * Uses Twilio WhatsApp API as the delivery layer.
 * Install: npm install twilio
 */
const axios = require("axios");
const { runMutation, runQuery } = require("../config/convex");

function getTwilioClient() {
  // Lazy-load so missing env doesn't crash startup
  const twilio = require("twilio");
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const FROM = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

// ── POST /api/whatsapp/send ─────────────────────────────────────────────────
// FR5 – Send a message from counsellor to lead/applicant
async function sendMessage(req, res, next) {
  try {
    const { to, message, leadId, caseId } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: "to and message are required" });
    }

    const client = getTwilioClient();
    const result = await client.messages.create({
      from: FROM,
      to: `whatsapp:${to}`,
      body: message,
    });

    // Persist outbound message to Convex messages table (FR5)
    await runMutation("messages:create", {
      leadId,
      caseId,
      channel: "whatsapp",
      content: message,
      direction: "outbound",
    });

    // Log activity if case is provided
    if (caseId) {
      await runMutation("activities:create", {
        caseId,
        type: "whatsappMessage",
        description: `Outbound WhatsApp: "${message.substring(0, 80)}"`,
      });
    }

    res.json({ success: true, sid: result.sid });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/whatsapp/webhook ──────────────────────────────────────────────
// FR5 – Receive inbound messages from Twilio and save to Convex
async function handleWebhook(req, res, next) {
  try {
    const { From, Body, WaId } = req.body;

    const phone = From ? From.replace("whatsapp:", "") : WaId;

    // Try to match the sender to an existing lead (FR5)
    const leads = await runQuery("leads:list", {
      paginationOpts: { numItems: 500, cursor: null },
    });
    const matchedLead = leads?.page?.find((l) => l.phone === phone);

    await runMutation("messages:create", {
      leadId: matchedLead?._id,
      channel: "whatsapp",
      content: Body || "",
      direction: "inbound",
    });

    if (matchedLead?._id) {
      await runMutation("activities:create", {
        caseId: undefined,
        type: "whatsappMessage",
        description: `Inbound WhatsApp from ${phone}: "${(Body || "").substring(0, 80)}"`,
      });
    }

    // Twilio expects a 200 TwiML or empty response
    res.set("Content-Type", "text/xml");
    res.send("<Response></Response>");
  } catch (err) {
    next(err);
  }
}

// ── POST /api/whatsapp/remind ────────────────────────────────────────────────
// FR12 – Send document collection reminder for a case
async function sendDocumentReminder(req, res, next) {
  try {
    const { caseId, to, applicantName } = req.body;
    if (!caseId || !to) {
      return res.status(400).json({ error: "caseId and to are required" });
    }

    // Fetch pending docs for context
    const docs = await runQuery("documents:listByCaseAndStatus", {
      caseId,
      status: "pending",
    });
    const docNames = docs.map((d) => d.name).join(", ") || "required documents";

    const message =
      `Hi ${applicantName || "there"}, this is a reminder from VisaFlow. ` +
      `The following documents are still pending for your visa application: ${docNames}. ` +
      `Please submit them at your earliest convenience.`;

    const client = getTwilioClient();
    await client.messages.create({ from: FROM, to: `whatsapp:${to}`, body: message });

    await runMutation("messages:create", {
      channel: "whatsapp",
      content: message,
      direction: "outbound",
    });

    await runMutation("activities:create", {
      caseId,
      type: "whatsappMessage",
      description: `Document reminder sent to ${to}`,
    });

    res.json({ success: true, message: "Document reminder sent" });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/whatsapp/bulk ──────────────────────────────────────────────────
// FR4 – Broadcast WhatsApp message to a filtered list of leads
async function sendBulkMessages(req, res, next) {
  try {
    const { leads, message } = req.body; // leads: [{ phone, name }]
    if (!leads?.length || !message) {
      return res.status(400).json({ error: "leads array and message are required" });
    }

    const client = getTwilioClient();
    const results = [];

    for (const lead of leads) {
      try {
        const result = await client.messages.create({
          from: FROM,
          to: `whatsapp:${lead.phone}`,
          body: message.replace("{{name}}", lead.name || ""),
        });
        results.push({ phone: lead.phone, status: "sent", sid: result.sid });
      } catch (e) {
        results.push({ phone: lead.phone, status: "failed", error: e.message });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/whatsapp/template ──────────────────────────────────────────────
// FR4 – Send Meta-approved WhatsApp template message
async function sendTemplate(req, res, next) {
  try {
    const { to, templateName, parameters } = req.body;
    if (!to || !templateName) {
      return res.status(400).json({ error: "to and templateName are required" });
    }

    // Build template message body from parameters for Twilio's content API
    const client = getTwilioClient();
    const result = await client.messages.create({
      from: FROM,
      to: `whatsapp:${to}`,
      contentSid: templateName, // Use Meta template SID when configured
      contentVariables: JSON.stringify(parameters || {}),
    });

    res.json({ success: true, sid: result.sid });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendMessage,
  handleWebhook,
  sendDocumentReminder,
  sendBulkMessages,
  sendTemplate,
};
