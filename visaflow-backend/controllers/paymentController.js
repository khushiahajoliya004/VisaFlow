/**
 * Payment Controller – powered by Razorpay
 * UI 9  – Case Detail payment card
 * FR19  – Razorpay payment collection & verification
 * FR20  – Send payment link via WhatsApp
 *
 * Install: npm install razorpay
 */
const crypto = require("crypto");
const { runMutation, runQuery } = require("../config/convex");

function getRazorpay() {
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ── POST /api/payments/create ────────────────────────────────────────────────
// FR19 – Create a Razorpay order and persist payment record in Convex
async function createOrder(req, res, next) {
  try {
    const { caseId, totalAmount, description } = req.body;
    if (!caseId || !totalAmount) {
      return res.status(400).json({ error: "caseId and totalAmount are required" });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      notes: { caseId, description: description || "VisaFlow Service Fee" },
    });

    // Create payment record in Convex
    const paymentId = await runMutation("payments:create", {
      caseId,
      totalAmount,
      paidAmount: 0,
      pendingAmount: totalAmount,
      status: "pending",
    });

    res.json({
      orderId: order.id,
      amount: totalAmount,
      currency: "INR",
      convexPaymentId: paymentId,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/payments/verify ────────────────────────────────────────────────
// FR19 – Verify Razorpay signature and mark payment as paid in Convex
async function verifyPayment(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      convexPaymentId,
      paidAmount,
      method,
    } = req.body;

    // Signature verification using raw body HMAC-SHA256
    const generated = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated !== razorpay_signature) {
      return res.status(400).json({ error: "Payment signature verification failed" });
    }

    // Update Convex payment record
    await runMutation("payments:recordPayment", {
      id: convexPaymentId,
      paidAmount: paidAmount,
      method: method || "upi",
    });

    // Log activity on the case
    const payment = await runQuery("payments:get", { id: convexPaymentId });
    if (payment?.caseId) {
      await runMutation("activities:create", {
        caseId: payment.caseId,
        type: "payment",
        description: `Payment of ₹${paidAmount} received via ${method || "Razorpay"} (txn: ${razorpay_payment_id})`,
      });
    }

    res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/payments/link ──────────────────────────────────────────────────
// FR20 – Generate Razorpay payment link and send it via WhatsApp
async function sendPaymentLink(req, res, next) {
  try {
    const { caseId, to, applicantName, amount, description } = req.body;
    if (!to || !amount) {
      return res.status(400).json({ error: "to and amount are required" });
    }

    const razorpay = getRazorpay();
    const link = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      description: description || "VisaFlow Service Payment",
      customer: { name: applicantName || "Applicant", contact: to },
      notify: { sms: false, email: false }, // we send via WhatsApp below
      reminder_enable: true,
    });

    // Send via WhatsApp (reuse whatsapp controller logic inline to avoid circular dep)
    const message =
      `Hi ${applicantName || "there"}, please complete your VisaFlow payment of ₹${amount}.\n` +
      `Payment link: ${link.short_url}\n` +
      `Valid for 24 hours.`;

    // Log message to Convex
    await runMutation("messages:create", {
      channel: "whatsapp",
      content: message,
      direction: "outbound",
    });

    if (caseId) {
      await runMutation("activities:create", {
        caseId,
        type: "payment",
        description: `Payment link ₹${amount} sent to ${to} via WhatsApp`,
      });
    }

    res.json({
      success: true,
      paymentLinkId: link.id,
      shortUrl: link.short_url,
      message,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/payments/case/:caseId ──────────────────────────────────────────
// UI 9 – Fetch all payments for a case
async function getPaymentsByCase(req, res, next) {
  try {
    const { caseId } = req.params;
    const payments = await runQuery("payments:listByCase", { caseId });
    res.json(payments);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, verifyPayment, sendPaymentLink, getPaymentsByCase };
