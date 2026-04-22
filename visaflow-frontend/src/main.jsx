import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App.jsx";

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "";
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function Root() {
  if (convex) {
    return (
      <ConvexProvider client={convex}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexProvider>
    );
  }
  // Convex URL not set yet – still render the UI with mock data
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
