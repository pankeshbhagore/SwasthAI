import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Home } from "lucide-react";

const NotFoundPage = () => (
  <div style={{
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center",
  }}>
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(0,229,255,0.1)", border: "2px solid rgba(0,229,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Zap size={36} color="var(--accent-cyan)" />
      </div>

      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 900, color: "var(--accent-cyan)", lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 10 }}>
          Page Not Found
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28, maxWidth: 320 }}>
          The page you're looking for doesn't exist. Let's get you back to safety.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/" className="btn btn-primary" style={{ padding: "11px 22px" }}>
          <Home size={16} /> Back to Home
        </Link>
        <Link to="/emergency" className="btn btn-danger" style={{ padding: "11px 22px" }}>
          🚨 Emergency SOS
        </Link>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
        Medical emergency? Call{" "}
        <a href="tel:108" style={{ color: "var(--accent-red)", fontWeight: 700 }}>108</a> immediately.
      </p>
    </motion.div>
  </div>
);

export default NotFoundPage;
