import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Pipeline from "@/pages/Pipeline";
import Cases from "@/pages/Cases";
import CaseDetail from "@/pages/CaseDetail";
import Documents from "@/pages/Documents";
import Workflows from "@/pages/Workflows";
import Inbox from "@/pages/Inbox";
import Automations from "@/pages/Automations";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/new" element={<Navigate to="/cases" replace />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/automations" element={<Automations />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
