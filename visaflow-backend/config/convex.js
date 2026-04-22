/**
 * Convex HTTP client for backend → Convex mutations/queries.
 * All 10 tables are accessed through this helper.
 * Used by every controller that reads/writes the database.
 */
const axios = require("axios");

const CONVEX_URL = process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.warn("[Convex] CONVEX_URL not set – DB calls will fail at runtime.");
}

/**
 * Run a Convex public query.
 * @param {string} name  - e.g. "leads:list"
 * @param {object} args
 */
async function runQuery(name, args = {}) {
  const res = await axios.post(
    `${CONVEX_URL}/api/query`,
    { path: name, args },
    { headers: { "Content-Type": "application/json" } },
  );
  return res.data.value;
}

/**
 * Run a Convex public mutation.
 * @param {string} name  - e.g. "leads:create"
 * @param {object} args
 */
async function runMutation(name, args = {}) {
  const res = await axios.post(
    `${CONVEX_URL}/api/mutation`,
    { path: name, args },
    { headers: { "Content-Type": "application/json" } },
  );
  return res.data.value;
}

module.exports = { runQuery, runMutation };
