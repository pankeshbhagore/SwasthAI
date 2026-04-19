/**
 * SwasthAI Service Worker
 * Enables 100% offline triage functionality for rural India
 * Challenge 3: Healthcare Assistant Agent — Agentic AI Hackathon 2026
 * 
 * Offline Features:
 * - Full rule-based symptom triage (no internet needed)
 * - First aid guide access
 * - Emergency numbers (108, 112, 100)
 * - Cached app shell for instant loading
 */

const CACHE_NAME = "swasthai-v1.0.0";
const OFFLINE_CACHE = "swasthai-offline-v1";

// Core app shell — always cache these
const APP_SHELL = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/static/css/main.chunk.css",
  "/manifest.json",
];

// Offline triage data — critical for rural areas without internet
const OFFLINE_TRIAGE_DATA = {
  emergencyKeywords: [
    "chest pain", "heart attack", "difficulty breathing", "seizure",
    "stroke", "unconscious", "heavy bleeding", "anaphylaxis",
    "choking", "severe burn", "poisoning", "overdose",
    "छाती में दर्द", "सांस लेने में तकलीफ", "बेहोश", // Hindi
    "மார்பு வலி", "மூச்சு கஷ்டம்",  // Tamil
    "ఛాతి నొప్పి", "శ్వాస తీసుకోవడం కష్టం", // Telugu
  ],
  emergencyNumbers: {
    ambulance: "108",
    national: "112",
    police: "100",
    fire: "101",
    women: "181",
    disaster: "1078",
  },
  firstAid: {
    "chest pain": "Stop all activity. Sit down. Loosen clothing. Chew aspirin if available. Call 108 immediately.",
    "breathing": "Sit upright, loosen clothing. Use inhaler if available. Call 108 if no improvement in 5 minutes.",
    "bleeding": "Apply firm direct pressure with clean cloth. Elevate if possible. Call 108.",
    "seizure": "Clear area, protect head. Do NOT restrain. Time the seizure. Call 108.",
    "burn": "Cool under running water 20 minutes. Cover loosely. Call 108 for severe burns.",
    "choking": "Encourage coughing. 5 back blows. 5 abdominal thrusts. Call 108.",
    "fever": "Rest, drink fluids, paracetamol. Doctor if >103°F or >3 days.",
  },
};

// ── Install Event ──────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SwasthAI SW] Installing...");
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(APP_SHELL).catch((err) => {
          console.warn("[SwasthAI SW] Shell cache partial:", err);
        });
      }),
      caches.open(OFFLINE_CACHE).then((cache) => {
        // Cache offline triage data as JSON
        const triageBlob = new Response(JSON.stringify(OFFLINE_TRIAGE_DATA), {
          headers: { "Content-Type": "application/json" },
        });
        return cache.put("/offline-triage-data", triageBlob);
      }),
    ]).then(() => {
      console.log("[SwasthAI SW] ✅ Installed. Offline triage ready.");
      return self.skipWaiting();
    })
  );
});

// ── Activate Event ─────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      console.log("[SwasthAI SW] ✅ Activated. Old caches cleared.");
      return self.clients.claim();
    })
  );
});

// ── Fetch Event — Network First, Offline Fallback ─────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ── API calls: network first, fail gracefully ──
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok && request.method === "GET") {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback — use cached response
          const cached = await caches.match(request);
          if (cached) return cached;
          
          // Return offline triage data for triage endpoint
          if (url.pathname.includes("/triage/")) {
            const triageCache = await caches.open(OFFLINE_CACHE);
            return triageCache.match("/offline-triage-data") || 
              new Response(JSON.stringify({ 
                offline: true, 
                message: "Offline mode — using local triage engine",
                severity: "UNKNOWN",
                advice: "No internet. For emergencies call 108."
              }), { headers: { "Content-Type": "application/json" } });
          }
          
          return new Response(JSON.stringify({ 
            offline: true, 
            error: "No internet connection",
            emergency: { call: "108", police: "100", national: "112" }
          }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        })
    );
    return;
  }

  // ── Static assets: cache first ──
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation
        if (request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});

// ── Background Sync — queue health logs when offline ──────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-health-data") {
    event.waitUntil(syncHealthData());
  }
});

async function syncHealthData() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const pendingKeys = await cache.keys();
    const pending = pendingKeys.filter((r) => r.url.includes("pending-health-"));
    
    for (const request of pending) {
      const response = await cache.match(request);
      const data = await response.json();
      
      try {
        await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        await cache.delete(request);
        console.log("[SwasthAI SW] Synced offline health data:", request.url);
      } catch {
        console.log("[SwasthAI SW] Sync failed, will retry:", request.url);
      }
    }
  } catch (err) {
    console.error("[SwasthAI SW] Sync error:", err);
  }
}

// ── Push Notifications — emergency health alerts ──────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.message || "SwasthAI Health Alert",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || "swasthai-alert",
    requireInteraction: data.emergency || false,
    actions: data.emergency
      ? [
          { action: "call-108", title: "Call 108" },
          { action: "dismiss", title: "Dismiss" },
        ]
      : [{ action: "open", title: "View" }],
    data: { url: data.url || "/dashboard" },
  };

  event.waitUntil(
    self.registration.showNotification("SwasthAI", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  if (event.action === "call-108") {
    event.waitUntil(clients.openWindow("tel:108"));
  } else {
    const url = event.notification.data?.url || "/";
    event.waitUntil(clients.openWindow(url));
  }
});

console.log("[SwasthAI SW] Service Worker loaded. Version:", CACHE_NAME);
