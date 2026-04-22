/**
 * Workflow automation routes
 * UI 4  – Workflow canvas
 * FR10  – Trigger actions on stage change
 * FR16  – Escalate inactive cases
 * FR30  – Automated follow-up sequences
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");
const {
  triggerOnStageChange,
  escalateInactiveCases,
  triggerFollowUp,
  getBlueprintTemplates,
  executeWorkflow,
} = require("../controllers/workflowController");

// POST /api/workflows/trigger  – fire actions when lead/case stage changes (FR10)
router.post("/trigger", verifyToken, triggerOnStageChange);

// POST /api/workflows/escalate  – mark overdue cases as escalated (FR16)
router.post(
  "/escalate",
  verifyToken,
  checkRole("admin", "manager"),
  escalateInactiveCases,
);

// POST /api/workflows/followup  – start follow-up sequence for a lead (FR30)
router.post("/followup", verifyToken, triggerFollowUp);

// GET  /api/workflows/blueprints  – list built-in workflow templates (UI 4)
router.get("/blueprints", verifyToken, getBlueprintTemplates);

// POST /api/workflows/execute/:workflowId  – manually run a saved workflow (UI 4)
router.post(
  "/execute/:workflowId",
  verifyToken,
  checkRole("admin", "manager"),
  executeWorkflow,
);

module.exports = router;
