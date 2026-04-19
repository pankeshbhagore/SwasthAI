import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ── PWA Service Worker — Offline Triage for Rural India ───────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("SwasthAI updated — refresh for latest version");
          }
        });
      });
      console.log("✅ SwasthAI offline triage active (PWA Service Worker registered)");
      // Background sync for offline health data
      if ("sync" in registration) {
        navigator.serviceWorker.ready.then((sw) => {
          sw.sync.register("sync-health-data").catch(() => {});
        });
      }
    } catch (err) {
      console.warn("Service Worker unavailable:", err);
    }
  });
}
