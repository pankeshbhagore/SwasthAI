import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Thermometer, X } from "lucide-react";
import { getAQIColor } from "../../utils/helpers";
import useAQI from "../../hooks/useAQI";
import { useAuth } from "../../context/AuthContext";

const AQIBanner = () => {
  const { user } = useAuth();
  const city = user?.address?.city || "delhi";
  const { aqi, weather } = useAQI(city);
  const [dismissed, setDismissed] = React.useState(false);

  if (!aqi || dismissed) return null;

  // Only show if AQI is moderate or worse
  if (aqi.aqi <= 50) return null;

  const aqiColor = getAQIColor(aqi.aqi);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: `${aqiColor}10`,
          border: `1px solid ${aqiColor}30`,
          borderRadius: "var(--radius-md)",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Wind size={15} color={aqiColor} />
            <span style={{ fontSize: 13, fontWeight: 700, color: aqiColor }}>
              AQI {aqi.aqi}
            </span>
            <span style={{
              padding: "2px 8px", borderRadius: "100px",
              background: `${aqiColor}20`, fontSize: 11, color: aqiColor, fontWeight: 600,
            }}>
              {aqi.category}
            </span>
          </div>

          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            📍 {aqi.city} — {aqi.advice}
          </span>

          {weather && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
              <Thermometer size={13} />
              {weather.temperature}°C · {weather.humidity}% humidity
              {weather.heatIndex !== "Normal" && (
                <span style={{ color: "var(--accent-amber)", fontWeight: 600, marginLeft: 4 }}>
                  ⚠️ Heat {weather.heatIndex}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: 4, display: "flex", flexShrink: 0,
          }}
        >
          <X size={15} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default AQIBanner;
