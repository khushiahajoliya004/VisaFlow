import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "counsellor", label: "Counsellor" },
  { value: "documentExecutive", label: "Document Executive" },
];

const inputStyle = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  fontSize: 14,
  color: "#1e293b",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 6,
};

function onFocus(e) {
  e.target.style.borderColor = "#3b82f6";
  e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
}
function onBlur(e) {
  e.target.style.borderColor = "#e2e8f0";
  e.target.style.boxShadow = "none";
}

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "counsellor",
    branch: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const { confirmPassword, ...payload } = form;
    const result = await register(payload);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(result.error);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f7f9fb",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 36 }}>
          <div style={{ width: 44, height: 44, background: "#001b44", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined icon-fill" style={{ color: "#fff", fontSize: 22 }}>colors_spark</span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#001b44", fontFamily: "Manrope, sans-serif", lineHeight: 1.2 }}>VisaFlow AI</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#3b5fc0", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.6 }}>Legal Workspace</div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", padding: "32px 32px 28px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#001b44", fontFamily: "Manrope, sans-serif", marginBottom: 4 }}>Create account</div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Join your team's workspace</div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 12px", marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#dc2626" }}>error</span>
              <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px", marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#16a34a" }}>check_circle</span>
              <span style={{ fontSize: 13, color: "#16a34a" }}>Account created! Redirecting to login…</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Smith"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Role + Branch */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: "100%",
                height: 44,
                background: (loading || success) ? "#94a3b8" : "linear-gradient(135deg, #001b44 0%, #002f6c 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: (loading || success) ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
