require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const whatsappRoutes = require("./routes/whatsapp");
const voiceRoutes = require("./routes/voice");
const paymentRoutes = require("./routes/payments");
const metaAdsRoutes = require("./routes/metaAds");
const googleDriveRoutes = require("./routes/googleDrive");
const workflowRoutes = require("./routes/workflows");
const analyticsRoutes = require("./routes/analytics");
const aiRoutes = require("./routes/ai");
const automationsRoutes = require("./routes/automations");

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body parsers ──────────────────────────────────────────────────────────────
// Raw body needed for Razorpay signature verification (FR19)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/meta", metaAdsRoutes);
app.use("/api/drive", googleDriveRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/automations", automationsRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message, err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`VisaFlow backend running on http://localhost:${PORT}`);
});

module.exports = app;
