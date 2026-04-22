import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate("/dashboard", { replace: true });
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
      <div style={{ width: "100%", maxWidth: 400 }}>

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
            <div style={{ fontSize: 22, fontWeight: 900, color: "#001b44", fontFamily: "Manrope, sans-serif", marginBottom: 4 }}>Welcome back</div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Sign in to your workspace</div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 12px", marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#dc2626" }}>error</span>
              <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                style={{
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
                }}
                onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{
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
                }}
                onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 44,
                background: loading ? "#94a3b8" : "linear-gradient(135deg, #001b44 0%, #002f6c 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Register</Link>
        </div>
      </div>
    </div>
  );
}
