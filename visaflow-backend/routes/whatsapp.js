/**
 * WhatsApp routes
 * UI 6  – Inbox (message thread view)
 * UI 10/11/12 – Automations & reminder flows
 * FR4  – WhatsApp opt-in / message delivery
 * FR5  – Two-way WhatsApp messaging
 * FR12 – Auto document reminder
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  sendMessage,
  handleWebhook,
  sendDocumentReminder,
  sendBulkMessages,
  sendTemplate,
} = require("../controllers/whatsappController");

// POST /api/whatsapp/send  – send a single WhatsApp message (FR5)
router.post("/send", verifyToken, sendMessage);

// POST /api/whatsapp/webhook  – receive inbound messages from Twilio/Meta (FR5)
router.post("/webhook", handleWebhook);

// POST /api/whatsapp/remind  – trigger document reminder for a case (FR12)
router.post("/remind", verifyToken, sendDocumentReminder);

// POST /api/whatsapp/bulk  – broadcast to a filtered lead segment (FR4)
router.post("/bulk", verifyToken, sendBulkMessages);

// POST /api/whatsapp/template  – send pre-approved Meta template (FR4)
router.post("/template", verifyToken, sendTemplate);

module.exports = router;
