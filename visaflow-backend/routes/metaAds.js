/**
 * Meta Ads / Facebook Lead Gen routes
 * FR25 – Auto-ingest leads from Meta Ads campaigns
 * FR2  – Auto-assign counsellor
 * FR3  – Auto-tag lead
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  verifyWebhook,
  receiveLead,
  syncLeads,
} = require("../controllers/metaAdsController");

// GET  /api/meta/webhook  – Meta challenge verification handshake (FR25)
router.get("/webhook", verifyWebhook);

// POST /api/meta/webhook  – receive live lead events from Meta (FR25)
router.post("/webhook", receiveLead);

// POST /api/meta/sync  – manual bulk-sync from Meta Ads API (FR25)
router.post("/sync", verifyToken, syncLeads);

module.exports = router;
