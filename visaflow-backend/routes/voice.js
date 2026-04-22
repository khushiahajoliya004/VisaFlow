/**
 * Voice AI routes
 * UI 6  – Inbox voice call card
 * FR6   – Auto-call new lead within 60 seconds
 * FR7   – AI transcription of call
 * FR8   – Auto-update lead status after call
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  triggerCall,
  handleWebhook,
  getTranscript,
} = require("../controllers/voiceController");

// POST /api/voice/call  – trigger VAPI call for a lead (FR6)
router.post("/call", verifyToken, triggerCall);

// POST /api/voice/webhook  – VAPI posts call events & transcript here (FR7)
router.post("/webhook", handleWebhook);

// GET  /api/voice/transcript/:callId  – fetch transcript & AI summary (FR7)
router.get("/transcript/:callId", verifyToken, getTranscript);

module.exports = router;
