/**
 * Role middleware – restricts routes to specific user roles.
 * FR23: Role-based access control
 * FR24: Branch-level data isolation
 *
 * Roles: admin | manager | counsellor | documentExecutive
 */
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
}

/**
 * Enforce branch isolation – non-admin users can only see their own branch.
 * FR24: Branch-level data isolation
 */
function enforceBranch(req, _res, next) {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    req.branchFilter = req.user.branch;
  }
  next();
}

module.exports = { checkRole, enforceBranch };
