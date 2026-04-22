/**
 * Auth Controller
 * Handles registration, login, logout, and profile retrieval.
 * FR23 – Role-based access control
 * FR24 – Branch-level data isolation
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { runQuery, runMutation } = require("../config/convex");

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, branch: user.branch },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, role, branch, avatar } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password and role are required" });
    }

    const existing = await runQuery("users:getByEmail", { email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userId = await runMutation("users:create", {
      name,
      email,
      password: hashedPassword,
      role,
      branch,
      avatar,
    });

    res.status(201).json({ message: "User registered", userId });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await runQuery("users:getByEmail", { email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,    // used by FR23 role checks
        branch: user.branch, // used by FR24 branch isolation
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout  – stateless JWT; client drops token; server logs action
async function logout(req, res) {
  // Log audit activity – useful for FR23 access control auditing
  console.log(`[Audit] User ${req.user.email} logged out at ${new Date().toISOString()}`);
  res.json({ message: "Logged out" });
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const user = await runQuery("users:get", { id: req.user.id });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { password: _pw, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe };
