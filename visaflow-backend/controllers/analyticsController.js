/**
 * Analytics Controller
 * UI 1  – Executive Dashboard
 * FR21  – Real-time KPI metrics (total leads, conversion rate, revenue, active cases)
 * FR22  – Conversion funnel & agent performance analytics
 *
 * Returns data structured to match the UI 1 chart components:
 *   - Monthly lead volume (organic vs referral, Jan–May)
 *   - Success rates by region (North America, EU, SEA, Middle East)
 *   - Agent performance table
 *   - AI Insights panel
 */
const { runQuery } = require("../config/convex");

// ── GET /api/analytics/dashboard ────────────────────────────────────────────
// FR21 – Top-level KPI cards: total leads, conversion rate, revenue, active cases
async function getDashboardStats(req, res, next) {
  try {
    const [leadsData, casesData] = await Promise.all([
      runQuery("leads:list", { paginationOpts: { numItems: 1000, cursor: null } }),
      runQuery("cases:list", { paginationOpts: { numItems: 1000, cursor: null } }),
    ]);

    const leads = leadsData?.page || [];
    const cases = casesData?.page || [];

    const totalLeads = leads.length;
    const closedLeads = leads.filter((l) => l.status === "closed").length;
    const qualifiedLeads = leads.filter((l) =>
      ["qualified", "documentsPending", "applicationFiled", "decisionPending", "closed"].includes(l.status),
    ).length;

    const conversionRate =
      totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100 * 10) / 10 : 0;

    const activeCases = cases.filter(
      (c) => c.status !== "Closed" && c.status !== "Rejected",
    ).length;

    // Revenue forecast from payments
    const paymentsPromises = cases.slice(0, 50).map((c) =>
      runQuery("payments:listByCase", { caseId: c._id }).catch(() => []),
    );
    const allPaymentsArrays = await Promise.all(paymentsPromises);
    const allPayments = allPaymentsArrays.flat();

    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const pendingRevenue = allPayments.reduce((sum, p) => sum + (p.pendingAmount || 0), 0);

    res.json({
      totalLeads,
      qualifiedLeads,
      closedLeads,
      conversionRate,
      activeCases,
      totalRevenue,
      pendingRevenue,
      revenueForecast: totalRevenue + pendingRevenue,
      newLeadsToday: leads.filter(
        (l) => l.createdAt > Date.now() - 24 * 60 * 60 * 1000,
      ).length,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/leads ─────────────────────────────────────────────────
// Lead volume breakdown by source and status
async function getLeadAnalytics(req, res, next) {
  try {
    const { page: leads = [] } = await runQuery("leads:list", {
      paginationOpts: { numItems: 1000, cursor: null },
    }) || {};

    const bySource = groupCount(leads, "source");
    const byStatus = groupCount(leads, "status");
    const byVisaType = groupCount(leads, "visaType");

    res.json({ bySource, byStatus, byVisaType, total: leads.length });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/conversions ──────────────────────────────────────────
// FR22 – Stage-by-stage funnel counts
async function getConversionFunnel(req, res, next) {
  try {
    const { page: leads = [] } = await runQuery("leads:list", {
      paginationOpts: { numItems: 1000, cursor: null },
    }) || {};

    const stages = [
      "newLead",
      "contacted",
      "qualified",
      "documentsPending",
      "applicationFiled",
      "decisionPending",
      "closed",
    ];

    const funnel = stages.map((stage) => ({
      stage,
      count: leads.filter((l) => l.status === stage).length,
    }));

    res.json({ funnel });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/revenue ───────────────────────────────────────────────
// FR21 – Revenue actuals and forecast (manager/admin only)
async function getRevenueStats(req, res, next) {
  try {
    const { page: cases = [] } = await runQuery("cases:list", {
      paginationOpts: { numItems: 200, cursor: null },
    }) || {};

    const allPaymentsArrays = await Promise.all(
      cases.map((c) => runQuery("payments:listByCase", { caseId: c._id }).catch(() => [])),
    );
    const payments = allPaymentsArrays.flat();

    const totalCollected = payments.reduce((s, p) => s + (p.paidAmount || 0), 0);
    const totalPending = payments.reduce((s, p) => s + (p.pendingAmount || 0), 0);
    const paidCount = payments.filter((p) => p.status === "paid").length;
    const partialCount = payments.filter((p) => p.status === "partial").length;
    const pendingCount = payments.filter((p) => p.status === "pending").length;

    res.json({
      totalCollected,
      totalPending,
      forecast: totalCollected + totalPending,
      paidCount,
      partialCount,
      pendingCount,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/agents ────────────────────────────────────────────────
// FR22 – Per-agent performance: cases handled, conversion rate, avg IELTS score
async function getAgentPerformance(req, res, next) {
  try {
    const [{ page: leads = [] }, counsellors] = await Promise.all([
      runQuery("leads:list", { paginationOpts: { numItems: 1000, cursor: null } }).then((r) => r || {}),
      runQuery("users:listByRole", { role: "counsellor" }),
    ]);

    const agentStats = (counsellors || []).map((agent) => {
      const agentLeads = leads.filter(
        (l) => l.assignedTo === agent._id,
      );
      const closed = agentLeads.filter((l) => l.status === "closed").length;
      const conversionRate =
        agentLeads.length > 0
          ? Math.round((closed / agentLeads.length) * 100)
          : 0;

      return {
        id: agent._id,
        name: agent.name,
        branch: agent.branch,
        totalLeads: agentLeads.length,
        closedLeads: closed,
        conversionRate,
        avgAIScore:
          agentLeads.length > 0
            ? Math.round(
                agentLeads.reduce((s, l) => s + (l.aiScore || 0), 0) /
                  agentLeads.length,
              )
            : 0,
      };
    });

    // Sort by conversion rate descending (FR22)
    agentStats.sort((a, b) => b.conversionRate - a.conversionRate);

    res.json(agentStats);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/regions ───────────────────────────────────────────────
// UI 1 – Success rates by destination region
async function getRegionStats(req, res, next) {
  try {
    const { page: leads = [] } = await runQuery("leads:list", {
      paginationOpts: { numItems: 1000, cursor: null },
    }) || {};

    const regionMap = {
      "North America": ["United States", "Canada", "USA"],
      "Europe": ["UK", "Germany", "France", "Netherlands", "Italy", "Spain", "United Kingdom"],
      "Southeast Asia": ["Australia", "New Zealand", "Singapore", "Malaysia"],
      "Middle East": ["UAE", "Dubai", "Saudi Arabia", "Qatar", "Kuwait"],
    };

    const stats = Object.entries(regionMap).map(([region, countries]) => {
      const regionLeads = leads.filter((l) =>
        countries.some((c) => l.country?.toLowerCase().includes(c.toLowerCase())),
      );
      const closed = regionLeads.filter((l) => l.status === "closed").length;
      return {
        region,
        totalLeads: regionLeads.length,
        closedLeads: closed,
        successRate:
          regionLeads.length > 0
            ? Math.round((closed / regionLeads.length) * 100)
            : 0,
      };
    });

    res.json(stats);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/monthly ───────────────────────────────────────────────
// UI 1 – Monthly lead volume: organic vs referral/ads (Jan–current month)
async function getMonthlyVolume(req, res, next) {
  try {
    const { page: leads = [] } = await runQuery("leads:list", {
      paginationOpts: { numItems: 1000, cursor: null },
    }) || {};

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentYear = now.getFullYear();

    const monthly = months.map((month, i) => {
      const monthLeads = leads.filter((l) => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() === i;
      });
      return {
        month,
        organic: monthLeads.filter((l) => l.source === "manual").length,
        ads: monthLeads.filter((l) => l.source === "metaAds").length,
        whatsapp: monthLeads.filter((l) => l.source === "whatsapp").length,
        csv: monthLeads.filter((l) => l.source === "csv").length,
        total: monthLeads.length,
      };
    });

    res.json(monthly);
  } catch (err) {
    next(err);
  }
}

// ── Helper ───────────────────────────────────────────────────────────────────
function groupCount(arr, key) {
  return arr.reduce((acc, item) => {
    const val = item[key] || "unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

module.exports = {
  getDashboardStats,
  getLeadAnalytics,
  getConversionFunnel,
  getRevenueStats,
  getAgentPerformance,
  getRegionStats,
  getMonthlyVolume,
};
