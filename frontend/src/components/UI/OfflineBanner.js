import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [justCameBack, setJustCameBack] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setJustCameBack(true);
      setTimeout(() => setJustCameBack(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(isOffline || justCameBack) && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000,
            padding: "10px 20px",
            background: isOffline ? "rgba(255,61,113,0.9)" : "rgba(0,255,136,0.9)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontSize: 13, fontWeight: 600, color: isOffline ? "white" : "#060b14",
          }}
        >
          {isOffline ? (
            <>
              <WifiOff size={16} />
              You're offline — Triage engine still works! AI features require internet.
            </>
          ) : (
            <>
              <Wifi size={16} />
              Back online! All AI features restored.
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
