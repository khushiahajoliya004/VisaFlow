/**
 * Payment routes
 * UI 9  – Case Detail payment card
 * FR19  – Razorpay payment collection
 * FR20  – Payment link via WhatsApp
 */
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  createOrder,
  verifyPayment,
  sendPaymentLink,
  getPaymentsByCase,
} = require("../controllers/paymentController");

// POST /api/payments/create  – create Razorpay order (FR19)
router.post("/create", verifyToken, createOrder);

// POST /api/payments/verify  – verify Razorpay signature & update Convex (FR19)
router.post("/verify", verifyToken, verifyPayment);

// POST /api/payments/link  – send payment link via WhatsApp (FR20)
router.post("/link", verifyToken, sendPaymentLink);

// GET  /api/payments/case/:caseId  – fetch all payments for a case (UI 9)
router.get("/case/:caseId", verifyToken, getPaymentsByCase);

module.exports = router;
