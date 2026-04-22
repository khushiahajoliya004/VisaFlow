/**
 * Voice AI Controller – powered by VAPI
 * UI 6  – Inbox voice call card
 * FR6   – Auto-call new lead within 60 seconds of creation
 * FR7   – AI transcription saved to activities table
 * FR8   – Auto-update lead status after call ends
 *
 * Install: npm install axios (already present)
 * VAPI docs: https://docs.vapi.ai
 */
const axios = require("axios");
const { runMutation, runQuery } = require("../config/convex");

const VAPI_BASE = "https://api.vapi.ai";

function vapiHeaders() {
  return { Authorization: `Bearer ${process.env.VAPI_API_KEY}` };
}

// ── POST /api/voice/call ─────────────────────────────────────────────────────
// FR6 – Trigger VAPI outbound call; target: within 60 seconds of lead creation
async function triggerCall(req, res, next) {
  try {
    const { leadId, phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });

    const payload = {
      assistantId: process.env.VAPI_ASSISTANT_ID,
      customer: {
        number: phone,
        name: name || "Applicant",
      },
      // Pass leadId as metadata so webhook can link transcript to lead (FR7)
      assistantOverrides: {
        metadata: { leadId },
      },
    };

    const { data } = await axios.post(`${VAPI_BASE}/call/phone`, payload, {
      headers: vapiHeaders(),
    });

    // Log call initiation to activities
    if (leadId) {
      await runMutation("activities:create", {
        type: "voiceCall",
        description: `Outbound AI call initiated to ${phone} (callId: ${data.id})`,
      });
    }

    res.json({ success: true, callId: data.id, status: data.status });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/voice/webhook ──────────────────────────────────────────────────
// FR7 – VAPI posts call events here; save transcript & update lead status
async function handleWebhook(req, res, next) {
  try {
    const event = req.body;
    const { type, call } = event;

    if (type === "call-ended" && call) {
      const leadId = call.assistantOverrides?.metadata?.leadId;
      const transcript = call.transcript || "";
      const summary = call.summary || "";

      // FR7 – Persist full transcript as an activity
      await runMutation("activities:create", {
        type: "voiceCall",
        description:
          `Call ended. Duration: ${call.duration || 0}s.\n` +
          `Summary: ${summary}\n\nTranscript:\n${transcript}`,
      });

      // FR8 – Move lead to "contacted" after a completed call
      if (leadId) {
        const lead = await runQuery("leads:get", { id: leadId }).catch(() => null);
        if (lead && lead.status === "newLead") {
          await runMutation("leads:updateStatus", { id: leadId, status: "contacted" });
        }

        // Save transcript as inbound message for the Inbox (UI 6)
        await runMutation("messages:create", {
          leadId,
          channel: "voiceCall",
          content: transcript,
          direction: "inbound",
          aiInsight: summary,
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/voice/transcript/:callId ───────────────────────────────────────
// FR7 – Fetch full transcript + AI summary for a completed call
async function getTranscript(req, res, next) {
  try {
    const { callId } = req.params;

    const { data } = await axios.get(`${VAPI_BASE}/call/${callId}`, {
      headers: vapiHeaders(),
    });

    res.json({
      callId,
      status: data.status,
      duration: data.duration,
      transcript: data.transcript || "",
      summary: data.summary || "",
      recordingUrl: data.recordingUrl || null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { triggerCall, handleWebhook, getTranscript };
