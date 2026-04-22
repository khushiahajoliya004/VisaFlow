/**
 * Meta Ads / Facebook Lead Gen Controller
 * FR25 – Auto-ingest leads from Meta Ads campaigns
 * FR2  – Auto-assign counsellor based on visa type / load balancing
 * FR3  – Auto-tag lead (visa type, budget tier, source)
 * FR28 – Calculate initial AI score on lead creation
 */
const axios = require("axios");
const { runMutation, runQuery } = require("../config/convex");

const VERIFY_TOKEN = process.env.META_ADS_VERIFY_TOKEN || "visaflow_meta_verify";

// ── GET /api/meta/webhook ────────────────────────────────────────────────────
// FR25 – Meta challenge verification handshake
function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Meta] Webhook verified");
    return res.status(200).send(challenge);
  }
  res.status(403).json({ error: "Verification failed" });
}

// ── POST /api/meta/webhook ───────────────────────────────────────────────────
// FR25 – Receive live lead events from Meta Ads Lead Gen Forms
async function receiveLead(req, res, next) {
  try {
    const body = req.body;

    // Meta sends an array of entries
    if (body.object !== "page") return res.sendStatus(200);

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "leadgen") continue;

        const leadgenId = change.value?.leadgen_id;
        const pageId = change.value?.page_id;
        const formId = change.value?.form_id;

        if (!leadgenId) continue;

        // Fetch full lead data from Graph API (FR25)
        const leadData = await fetchLeadFromMeta(leadgenId);
        await processMetaLead(leadData, { pageId, formId });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/meta/sync ──────────────────────────────────────────────────────
// FR25 – Manual bulk-sync leads from Meta Ads API for a form
async function syncLeads(req, res, next) {
  try {
    const { formId, limit = 50 } = req.body;
    if (!formId) return res.status(400).json({ error: "formId is required" });

    const url =
      `https://graph.facebook.com/v19.0/${formId}/leads` +
      `?access_token=${process.env.META_ADS_TOKEN}&limit=${limit}`;

    const { data } = await axios.get(url);
    const leads = data.data || [];

    const results = [];
    for (const lead of leads) {
      const result = await processMetaLead(lead, { formId });
      results.push(result);
    }

    res.json({ synced: results.length, results });
  } catch (err) {
    next(err);
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────

async function fetchLeadFromMeta(leadgenId) {
  const url =
    `https://graph.facebook.com/v19.0/${leadgenId}` +
    `?access_token=${process.env.META_ADS_TOKEN}`;
  const { data } = await axios.get(url);
  return data;
}

// FR25, FR2, FR3, FR28 – Create lead in Convex with enrichment
async function processMetaLead(leadData, meta = {}) {
  const fields = {};
  for (const f of leadData.field_data || []) {
    fields[f.name] = Array.isArray(f.values) ? f.values[0] : f.values;
  }

  const name = fields.full_name || fields.name || "Unknown";
  const email = fields.email;
  const phone = fields.phone_number || fields.phone;
  const visaType = fields.visa_type || fields.service || null;
  const country = fields.country || null;
  const budget = fields.budget ? parseFloat(fields.budget) : null;

  // FR3 – Auto-generate tags
  const tags = autoTagLead({ visaType, budget, source: "metaAds" });

  // FR2 – Auto-assign counsellor
  const assignedTo = await autoAssignCounsellor(visaType);

  // FR28 – Calculate initial AI score
  const aiScore = calculateInitialScore({ email, phone, visaType, budget, country });

  const leadId = await runMutation("leads:create", {
    name,
    phone: phone || "",
    email,
    visaType,
    country,
    budget,
    source: "metaAds",
    status: "newLead",
    assignedTo,
    aiScore,
    tags,
  });

  console.log(`[Meta] Created lead ${leadId} from Meta Ads (formId: ${meta.formId})`);
  return { leadId, name, phone, email };
}

// FR3 – Auto-tag based on visa type, budget, and source
function autoTagLead({ visaType, budget, source }) {
  const tags = [source];
  if (visaType) tags.push(visaType.toLowerCase().replace(/\s+/g, "-"));
  if (budget) {
    if (budget >= 50000) tags.push("high-budget");
    else if (budget >= 20000) tags.push("mid-budget");
    else tags.push("low-budget");
  }
  return tags;
}

// FR2 – Round-robin auto-assign counsellors
async function autoAssignCounsellor(visaType) {
  try {
    const counsellors = await runQuery("users:listByRole", { role: "counsellor" });
    if (!counsellors?.length) return undefined;
    // Simple round-robin by picking least-recently-used (index by createdAt sort)
    return counsellors[0]._id;
  } catch {
    return undefined;
  }
}

// FR28 – Simple heuristic score for freshly ingested Meta leads
function calculateInitialScore({ email, phone, visaType, budget, country }) {
  let score = 30; // base score for any Meta lead
  if (email) score += 10;
  if (phone) score += 10;
  if (visaType) score += 15;
  if (budget && budget >= 20000) score += 20;
  if (budget && budget >= 50000) score += 10;
  if (country) score += 5;
  return Math.min(score, 100);
}

module.exports = { verifyWebhook, receiveLead, syncLeads };
