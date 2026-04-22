/**
 * AI Controller – powered by OpenAI GPT-4o
 * UI 1  – AI Insights panel on Executive Dashboard
 * UI 9  – AI Copilot on Case Detail
 * FR28  – AI lead scoring 0-100
 * FR29  – Document verification & next-best-action recommendations
 *
 * Install: npm install openai
 */
const { runQuery, runMutation } = require("../config/convex");

function getOpenAI() {
  const OpenAI = require("openai");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ── POST /api/ai/score ───────────────────────────────────────────────────────
// FR28 – Score a lead 0-100 using profile completeness + AI reasoning
async function calculateLeadScore(req, res, next) {
  try {
    const { leadId } = req.body;
    if (!leadId) return res.status(400).json({ error: "leadId is required" });

    const lead = await runQuery("leads:get", { id: leadId });
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    const score = await computeLeadScore(lead);

    // Persist score back to Convex
    await runMutation("leads:update", { id: leadId, aiScore: score.total });

    res.json(score);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/ai/recommend ───────────────────────────────────────────────────
// Recommend next counsellor actions for a specific lead
async function getRecommendations(req, res, next) {
  try {
    const { leadId } = req.body;
    if (!leadId) return res.status(400).json({ error: "leadId is required" });

    const lead = await runQuery("leads:get", { id: leadId });
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    const recommendations = await askGPT(
      `You are a visa consultancy AI assistant. ` +
        `Given this lead profile, suggest the 3 most important actions for the counsellor.\n` +
        `Lead: ${JSON.stringify({ name: lead.name, visaType: lead.visaType, country: lead.country, status: lead.status, budget: lead.budget, aiScore: lead.aiScore })}\n` +
        `Return JSON: { "actions": [{ "priority": "high|medium|low", "action": "...", "reason": "..." }] }`,
    );

    res.json(recommendations);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/ai/insight ─────────────────────────────────────────────────────
// UI 1 – High-level AI insights for the Executive Dashboard
async function getAIInsights(req, res, next) {
  try {
    const { page: leads = [] } = await runQuery("leads:list", {
      paginationOpts: { numItems: 200, cursor: null },
    }) || {};

    const highPriority = leads
      .filter((l) => (l.aiScore || 0) >= 75 && l.status !== "closed")
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, 5)
      .map((l) => ({ id: l._id, name: l.name, score: l.aiScore, status: l.status }));

    const bottlenecks = detectBottlenecks(leads);

    // GPT-generated insight summary
    const summary = await askGPT(
      `You are a visa CRM analyst. Given ${leads.length} leads with status distribution: ` +
        `${JSON.stringify(groupCount(leads, "status"))}, ` +
        `generate 2 brief actionable business insights in JSON: { "insights": ["...", "..."] }`,
    );

    res.json({
      highPriorityLeads: highPriority,
      bottlenecks,
      aiSummary: summary?.insights || [],
      scoredLeads: leads.filter((l) => l.aiScore !== undefined).length,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/ai/nextactions ─────────────────────────────────────────────────
// UI 9, FR29 – Return next best actions for a case (AI Copilot)
async function getNextActions(req, res, next) {
  try {
    const { caseId } = req.body;
    if (!caseId) return res.status(400).json({ error: "caseId is required" });

    const [caseDoc, activities, documents, tasks] = await Promise.all([
      runQuery("cases:get", { id: caseId }),
      runQuery("activities:listByCase", {
        caseId,
        paginationOpts: { numItems: 10, cursor: null },
      }),
      runQuery("documents:listByCase", { caseId }),
      runQuery("tasks:listByCase", { caseId }),
    ]);

    if (!caseDoc) return res.status(404).json({ error: "Case not found" });

    const pendingDocs = (documents || []).filter((d) => d.status === "pending").map((d) => d.name);
    const pendingTasks = ((tasks || []).filter((t) => t.status === "pending")).map((t) => t.title);

    const context = {
      caseStatus: caseDoc.status,
      visaType: caseDoc.visaType,
      pendingDocuments: pendingDocs,
      pendingTasks,
      recentActivities: (activities?.page || []).slice(0, 3).map((a) => a.description),
    };

    const result = await askGPT(
      `You are an AI Copilot for a visa consultancy CRM. ` +
        `Given this case context, suggest the next 3 most impactful actions.\n` +
        `Context: ${JSON.stringify(context)}\n` +
        `Return JSON: { "nextActions": [{ "action": "...", "priority": "high|medium|low", "rationale": "..." }] }`,
    );

    res.json(result || { nextActions: [] });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/ai/verify-document ────────────────────────────────────────────
// FR29 – AI document authenticity check (delegates to Google Drive controller logic)
async function verifyDocumentWithAI(req, res, next) {
  try {
    const { documentId, fileUrl, documentType } = req.body;
    if (!fileUrl) return res.status(400).json({ error: "fileUrl is required" });

    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Analyze this ${documentType || "document"} for authenticity. ` +
                `Check for: proper official formatting, watermarks/seals, ` +
                `consistent fonts, no signs of digital tampering. ` +
                `Return JSON: { "verified": true/false, "confidence": 0.0-1.0, ` +
                `"issues": [], "recommendation": "approve|reject|manual_review" }`,
            },
            { type: "image_url", image_url: { url: fileUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Update Convex if documentId provided
    if (documentId) {
      const newStatus = result.verified ? "verified" : "rejected";
      await runMutation("documents:updateStatus", {
        id: documentId,
        status: newStatus,
        notes: result.recommendation,
      });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────

async function computeLeadScore(lead) {
  // Deterministic component (fast, no API call)
  const components = {
    profileCompleteness: scoreProfileCompleteness(lead),
    financialReadiness: Math.min((lead.financialReadiness || 0), 25),
    ieltsScore: lead.ieltsScore ? Math.min(Math.round((lead.ieltsScore / 9) * 20), 20) : 0,
    sourceQuality: { metaAds: 10, manual: 8, whatsapp: 7, csv: 5 }[lead.source] || 5,
    urgency: lead.status !== "newLead" ? 5 : 0,
  };

  const total = Object.values(components).reduce((s, v) => s + v, 0);

  return {
    total: Math.min(total, 100),
    components,
    grade: total >= 75 ? "A" : total >= 50 ? "B" : total >= 25 ? "C" : "D",
  };
}

function scoreProfileCompleteness(lead) {
  let score = 0;
  if (lead.name) score += 5;
  if (lead.phone) score += 5;
  if (lead.email) score += 5;
  if (lead.visaType) score += 5;
  if (lead.country) score += 5;
  if (lead.budget) score += 5;
  return score; // max 30
}

function detectBottlenecks(leads) {
  const bottlenecks = [];
  const documentsPending = leads.filter((l) => l.status === "documentsPending").length;
  const newLeads = leads.filter((l) => l.status === "newLead").length;

  if (documentsPending > 10) {
    bottlenecks.push({
      type: "document_collection",
      severity: "high",
      message: `${documentsPending} leads stuck at documents pending stage`,
    });
  }
  if (newLeads > 20) {
    bottlenecks.push({
      type: "uncontacted_leads",
      severity: "medium",
      message: `${newLeads} new leads not yet contacted`,
    });
  }
  return bottlenecks;
}

async function askGPT(prompt) {
  try {
    if (!process.env.OPENAI_API_KEY) return null;
    const openai = getOpenAI();
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return null;
  }
}

function groupCount(arr, key) {
  return arr.reduce((acc, item) => {
    const val = item[key] || "unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

module.exports = {
  calculateLeadScore,
  getRecommendations,
  getAIInsights,
  getNextActions,
  verifyDocumentWithAI,
};
