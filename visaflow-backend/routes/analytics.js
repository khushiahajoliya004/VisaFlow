/**
 * Analytics routes
 * UI 1  – Executive Dashboard
 * FR21  – Real-time KPI metrics
 * FR22  – Conversion funnel analytics
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");
const {
  getDashboardStats,
  getLeadAnalytics,
  getConversionFunnel,
  getRevenueStats,
  getAgentPerformance,
  getRegionStats,
  getMonthlyVolume,
} = require("../controllers/analyticsController");

const managerUp = checkRole("admin", "manager");

// GET /api/analytics/dashboard   – top-level KPI cards (UI 1, FR21)
router.get("/dashboard", verifyToken, getDashboardStats);

// GET /api/analytics/leads       – lead volume over time (UI 1)
router.get("/leads", verifyToken, getLeadAnalytics);

// GET /api/analytics/conversions – stage-by-stage funnel (FR22)
router.get("/conversions", verifyToken, getConversionFunnel);

// GET /api/analytics/revenue     – revenue forecast & actuals (FR21)
router.get("/revenue", verifyToken, managerUp, getRevenueStats);

// GET /api/analytics/agents      – per-agent KPIs (FR22)
router.get("/agents", verifyToken, managerUp, getAgentPerformance);

// GET /api/analytics/regions     – success rates by region (UI 1 chart)
router.get("/regions", verifyToken, getRegionStats);

// GET /api/analytics/monthly     – Jan-Dec organic vs referral volumes (UI 1)
router.get("/monthly", verifyToken, getMonthlyVolume);

module.exports = router;
