/**
 * Automations routes
 * UI 10 – Auto Reminders list
 * UI 11 – Reminder builder
 * UI 12 – Automation templates
 * FR30  – Automated follow-up & reminder sequences
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");
const {
  getAll,
  createAutomation,
  toggleAutomation,
  runAutomation,
  getTemplates,
} = require("../controllers/automationsController");

// GET  /api/automations              – list all automations (UI 10)
router.get("/", verifyToken, getAll);

// POST /api/automations/create       – create a new automation (UI 11, FR30)
router.post(
  "/create",
  verifyToken,
  checkRole("admin", "manager"),
  createAutomation,
);

// POST /api/automations/toggle/:id   – enable / disable an automation (UI 10)
router.post(
  "/toggle/:id",
  verifyToken,
  checkRole("admin", "manager"),
  toggleAutomation,
);

// POST /api/automations/run/:id      – manually trigger an automation now (UI 10)
router.post("/run/:id", verifyToken, checkRole("admin", "manager"), runAutomation);

// GET  /api/automations/templates    – pre-built templates (UI 12)
router.get("/templates", verifyToken, getTemplates);

module.exports = router;
