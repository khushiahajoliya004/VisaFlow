/**
 * Automations Controller
 * UI 10 – Auto Reminders list view
 * UI 11 – Reminder builder / editor
 * UI 12 – Automation templates gallery
 * FR30  – Automated multi-step follow-up & reminder sequences
 */
const { runQuery, runMutation } = require("../config/convex");

// ── GET /api/automations ─────────────────────────────────────────────────────
// UI 10 – List all automations with their active state
async function getAll(req, res, next) {
  try {
    const result = await runQuery("automations:list", {
      paginationOpts: { numItems: 100, cursor: null },
    });
    res.json(result?.page || []);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/automations/create ─────────────────────────────────────────────
// UI 11, FR30 – Create a new automation reminder sequence
async function createAutomation(req, res, next) {
  try {
    const { name, trigger, channel, steps, isActive } = req.body;

    if (!name || !trigger || !channel || !steps?.length) {
      return res.status(400).json({
        error: "name, trigger, channel, and at least one step are required",
      });
    }

    // Validate steps structure
    const validatedSteps = steps.map((step, i) => ({
      order: step.order ?? i + 1,
      action: step.action,
      delay: step.delay ?? 0,        // delay in milliseconds
      config: step.config ?? null,
    }));

    const id = await runMutation("automations:create", {
      name,
      trigger,
      channel,
      isActive: isActive ?? true,
      steps: validatedSteps,
    });

    res.status(201).json({ id, message: "Automation created" });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/automations/toggle/:id ────────────────────────────────────────
// UI 10 – Enable or disable an automation
async function toggleAutomation(req, res, next) {
  try {
    const { id } = req.params;
    await runMutation("automations:toggle", { id });
    res.json({ success: true, message: "Automation toggled" });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/automations/run/:id ────────────────────────────────────────────
// UI 10 – Manually trigger an automation now for a given lead or case
async function runAutomation(req, res, next) {
  try {
    const { id } = req.params;
    const { leadId, caseId } = req.body;

    const automation = await runQuery("automations:get", { id });
    if (!automation) return res.status(404).json({ error: "Automation not found" });
    if (!automation.isActive) {
      return res.status(400).json({ error: "Automation is disabled" });
    }

    const results = [];
    for (const step of automation.steps || []) {
      const result = await executeAutomationStep(step, {
        leadId,
        caseId,
        channel: automation.channel,
        automationName: automation.name,
      });
      results.push({ step: step.order, action: step.action, result });
    }

    // Log run as an activity
    if (caseId) {
      await runMutation("activities:create", {
        caseId,
        type: "note",
        description: `Automation "${automation.name}" executed manually (${results.length} steps)`,
      });
    }

    res.json({ success: true, automationId: id, stepsExecuted: results.length, results });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/automations/templates ───────────────────────────────────────────
// UI 12 – Return pre-built automation templates the user can import
async function getTemplates(req, res) {
  res.json(AUTOMATION_TEMPLATES);
}

// ── Step executor ─────────────────────────────────────────────────────────────
async function executeAutomationStep(step, context) {
  const { leadId, caseId, channel, automationName } = context;

  switch (step.action) {
    case "send_whatsapp":
    case "send_sms":
      // In production: call Twilio helper
      await runMutation("messages:create", {
        leadId,
        caseId,
        channel: channel === "both" ? "whatsapp" : channel,
        content: step.config || `Automated message from ${automationName}`,
        direction: "outbound",
      });
      return { sent: true };

    case "send_email":
      // In production: call SendGrid/Nodemailer
      return { sent: true, note: "Email queued" };

    case "create_task":
      return await runMutation("tasks:create", {
        caseId,
        title: step.config || `Follow-up from automation: ${automationName}`,
        status: "pending",
        dueDate: Date.now() + (step.delay || 0),
      });

    case "update_lead_status":
      if (leadId && step.config) {
        await runMutation("leads:updateStatus", { id: leadId, status: step.config });
      }
      return { updated: true };

    case "log_note":
      if (caseId) {
        await runMutation("activities:create", {
          caseId,
          type: "note",
          description: step.config || `Automation step: ${automationName}`,
        });
      }
      return { logged: true };

    default:
      return { skipped: true, reason: `Unknown action: ${step.action}` };
  }
}

// ── Templates ─────────────────────────────────────────────────────────────────
// UI 12 – Three pre-built automation templates shown in the gallery

const AUTOMATION_TEMPLATES = [
  {
    id: "ielts-reminder-flow",
    name: "IELTS Reminder Flow",
    description:
      "Remind applicants about upcoming IELTS exam dates and preparation resources.",
    trigger: "lead:qualified",
    channel: "whatsapp",
    steps: [
      {
        order: 1,
        action: "send_whatsapp",
        delay: 0,
        config:
          "Hi {{name}}, congratulations on qualifying! " +
          "Your IELTS exam is an important next step. " +
          "Have you registered? Reply YES or NO.",
      },
      {
        order: 2,
        action: "create_task",
        delay: 3 * 24 * 60 * 60 * 1000, // 3 days
        config: "IELTS follow-up: check exam registration status",
      },
      {
        order: 3,
        action: "send_whatsapp",
        delay: 7 * 24 * 60 * 60 * 1000, // 7 days
        config:
          "Hi {{name}}, just checking in. Have you booked your IELTS exam? " +
          "We can recommend preparation centres if needed.",
      },
    ],
  },
  {
    id: "doc-followup",
    name: "Document Follow-Up",
    description:
      "Automatically chase applicants for pending documents over a 2-week window.",
    trigger: "case:documentsPending",
    channel: "both",
    steps: [
      {
        order: 1,
        action: "send_whatsapp",
        delay: 0,
        config:
          "Hi {{name}}, your visa application is progressing well! " +
          "We are waiting on a few documents. Could you please send them today?",
      },
      {
        order: 2,
        action: "send_whatsapp",
        delay: 3 * 24 * 60 * 60 * 1000,
        config:
          "Hi {{name}}, friendly reminder: we still need your pending documents " +
          "to proceed with your visa application.",
      },
      {
        order: 3,
        action: "create_task",
        delay: 5 * 24 * 60 * 60 * 1000,
        config: "Escalate document follow-up: call applicant directly",
      },
      {
        order: 4,
        action: "send_whatsapp",
        delay: 10 * 24 * 60 * 60 * 1000,
        config:
          "Hi {{name}}, this is our final reminder before we flag your case. " +
          "Please submit your documents to avoid delays.",
      },
    ],
  },
  {
    id: "payment-due-alert",
    name: "Payment Due Alert",
    description:
      "Notify applicants about upcoming or overdue payments and send a payment link.",
    trigger: "payment:pending",
    channel: "whatsapp",
    steps: [
      {
        order: 1,
        action: "send_whatsapp",
        delay: 0,
        config:
          "Hi {{name}}, your VisaFlow service payment of ₹{{amount}} is now due. " +
          "Please complete it via your payment link.",
      },
      {
        order: 2,
        action: "log_note",
        delay: 0,
        config: "Payment due alert sent to applicant",
      },
      {
        order: 3,
        action: "send_whatsapp",
        delay: 3 * 24 * 60 * 60 * 1000,
        config:
          "Hi {{name}}, your payment is still pending. " +
          "Please complete it to avoid delays in your visa processing.",
      },
      {
        order: 4,
        action: "create_task",
        delay: 5 * 24 * 60 * 60 * 1000,
        config: "Overdue payment: call applicant and resend payment link",
      },
    ],
  },
];

module.exports = { getAll, createAutomation, toggleAutomation, runAutomation, getTemplates };
