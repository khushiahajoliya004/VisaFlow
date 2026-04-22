const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

// POST /api/auth/register  – create staff account (admin only in prod)
router.post("/register", register);

// POST /api/auth/login  – returns JWT + user profile
router.post("/login", login);

// POST /api/auth/logout  – client-side token drop; kept for audit log
router.post("/logout", verifyToken, logout);

// GET  /api/auth/me  – returns current user from JWT
router.get("/me", verifyToken, getMe);

module.exports = router;
