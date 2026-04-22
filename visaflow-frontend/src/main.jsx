import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "@/context/AuthContext";
import "./index.css";
import App from "./App.jsx";

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "";
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function Root() {
  const app = (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );

  if (convex) {
    return <ConvexProvider client={convex}>{app}</ConvexProvider>;
  }

  return app;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
