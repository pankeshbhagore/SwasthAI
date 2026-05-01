import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Star, Navigation, Clock, Loader, AlertCircle } from "lucide-react";
import api from "../../utils/api";
import useGeolocation from "../../hooks/useGeolocation";
import toast from "react-hot-toast";

const HospitalCard = ({ hospital, index }) => {
  const isOpen = hospital.isOpen;
  const isEmergency = hospital.isEmergency;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card"
      style={{ padding: 18 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {hospital.name}
            </h4>
            {isEmergency && (
              <span style={{
                background: "rgba(255,61,113,0.12)", border: "1px solid rgba(255,61,113,0.3)",
                borderRadius: 4, padding: "1px 6px", fontSize: 10, color: "var(--accent-red)",
                fontWeight: 700, flexShrink: 0,
              }}>ER</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
            <MapPin size={11} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hospital.address}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-cyan)" }}>
            {hospital.distanceKm} km
          </div>
          <div style={{
            fontSize: 11, color: isOpen ? "var(--accent-green)" : "var(--accent-red)",
            display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", marginTop: 2,
          }}>
            <Clock size={10} />
            {isOpen === undefined ? "—" : isOpen ? "Open" : "Closed"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {hospital.rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent-amber)" }}>
            <Star size={12} fill="currentColor" />
            <span style={{ fontWeight: 600 }}>{hospital.rating}</span>
            {hospital.userRatingsTotal > 0 && (
              <span style={{ color: "var(--text-muted)" }}>({hospital.userRatingsTotal})</span>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ padding: "5px 10px", fontSize: 12 }}
          >
            <Navigation size={13} />
            Directions
          </a>
          {hospital.phone && (
            <a href={`tel:${hospital.phone}`} className="btn btn-primary" style={{ padding: "5px 10px", fontSize: 12 }}>
              <Phone size={13} />
              Call
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const HospitalFinder = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState("MILD");
  const [locationName, setLocationName] = useState(null);
  const { location, loading: locLoading, error: locError, getLocation } = useGeolocation();

  useEffect(() => {
    if (location) fetchHospitals();
  }, [location, severity]);

  const fetchHospitals = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const res = await api.get("/maps/hospitals", {
        params: { lat: location.lat, lng: location.lng, severity },
      });
      const data = res.data.data;
      setHospitals(data?.hospitals || []);
      if (data?.locationName) setLocationName(data.locationName);
      if (data?.demo) {
        toast("📍 Showing demo hospitals. Add Google Maps API key for real results.", { icon: "ℹ️" });
      }
    } catch {
      toast.error("Could not fetch hospitals.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Search Controls */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <MapPin size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>Find Nearby Hospitals</h3>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {["MILD", "MODERATE", "EMERGENCY"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              style={{
                padding: "7px 16px",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${severity === s ? "rgba(0,229,255,0.4)" : "var(--border)"}`,
                background: severity === s ? "rgba(0,229,255,0.1)" : "transparent",
                color: severity === s ? "var(--accent-cyan)" : "var(--text-muted)",
                fontSize: 12, fontWeight: severity === s ? 700 : 400,
                cursor: "pointer", transition: "all var(--transition)",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={getLocation}
          disabled={locLoading}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          {locLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <MapPin size={16} />}
          {location ? "Refresh Location & Search" : "Use My Location to Find Hospitals"}
        </button>

        {locError && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--accent-red)", display: "flex", alignItems: "center", gap: 5 }}>
            <AlertCircle size={12} /> {locError}
          </div>
        )}

        {location && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            📍 Location detected: <strong style={{ color: "var(--text-primary)" }}>{locationName || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}</strong>
          </div>
        )}
      </div>

      {/* Emergency Quick Dial */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
        background: "rgba(255,61,113,0.05)", border: "1px solid rgba(255,61,113,0.15)",
        borderRadius: "var(--radius-md)", padding: 16,
      }}>
        {[
          { label: "Ambulance", number: "108", emoji: "🚑" },
          { label: "Police", number: "100", emoji: "🚔" },
          { label: "National Emergency", number: "112", emoji: "🆘" },
        ].map(({ label, number, emoji }) => (
          <a
            key={number}
            href={`tel:${number}`}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "12px 8px",
              background: "rgba(255,61,113,0.08)", border: "1px solid rgba(255,61,113,0.2)",
              borderRadius: "var(--radius-sm)", textDecoration: "none",
              transition: "all var(--transition)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,61,113,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,61,113,0.08)"}
          >
            <span style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-red)" }}>{number}</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</span>
          </a>
        ))}
      </div>

      {/* Hospital List */}
      {loading && (
        <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
          <div className="spinner" style={{ width: 28, height: 28, margin: "0 auto 10px" }} />
          Searching nearby hospitals...
        </div>
      )}

      {!loading && hospitals.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Found {hospitals.length} hospitals near you
          </div>
          {hospitals.map((h, i) => <HospitalCard key={h.id} hospital={h} index={i} />)}
        </div>
      )}

      {!loading && location && hospitals.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 14 }}>
          No hospitals found. Try a different severity level.
        </div>
      )}
    </div>
  );
};

export default HospitalFinder;
