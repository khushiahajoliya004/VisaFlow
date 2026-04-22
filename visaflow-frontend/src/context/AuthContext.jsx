import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("vf_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("vf_token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem("vf_token", token);
    else localStorage.removeItem("vf_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("vf_user", JSON.stringify(user));
    else localStorage.removeItem("vf_user");
  }, [user]);

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API}/login`, { email, password });
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function register(fields) {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API}/register`, fields);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await axios.post(`${API}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // logout is best-effort
    } finally {
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
