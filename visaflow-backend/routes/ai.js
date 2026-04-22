/**
 * AI routes
 * UI 1  – AI Insights panel on Executive Dashboard
 * UI 9  – AI Copilot on Case Detail
 * FR28  – AI lead scoring
 * FR29  – AI document verification & next-action recommendation
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  calculateLeadScore,
  getRecommendations,
  getAIInsights,
  getNextActions,
  verifyDocumentWithAI,
} = require("../controllers/aiController");

// POST /api/ai/score           – score a lead 0-100 (FR28)
router.post("/score", verifyToken, calculateLeadScore);

// POST /api/ai/recommend       – get counsellor recommendations for a lead
router.post("/recommend", verifyToken, getRecommendations);

// POST /api/ai/insight         – high-level AI insight for dashboard (UI 1)
router.post("/insight", verifyToken, getAIInsights);

// POST /api/ai/nextactions     – next best actions for a case (UI 9, FR29)
router.post("/nextactions", verifyToken, getNextActions);

// POST /api/ai/verify-document – AI document authenticity check (FR29)
router.post("/verify-document", verifyToken, verifyDocumentWithAI);

module.exports = router;
