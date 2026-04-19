// Severity helpers
export const getSeverityColor = (severity) => {
  const map = {
    EMERGENCY: "#ff3d71",
    MODERATE: "#ffb300",
    MILD: "#00ff88",
    NORMAL: "#00e5ff",
  };
  return map[severity?.toUpperCase()] || map.NORMAL;
};

export const getSeverityBadgeClass = (severity) => {
  const map = {
    EMERGENCY: "badge-emergency",
    MODERATE: "badge-moderate",
    MILD: "badge-mild",
    NORMAL: "badge-normal",
  };
  return map[severity?.toUpperCase()] || "badge-normal";
};

export const getSeverityEmoji = (severity) => {
  const map = {
    EMERGENCY: "🚨",
    MODERATE: "⚠️",
    MILD: "✅",
    NORMAL: "💚",
  };
  return map[severity?.toUpperCase()] || "💙";
};

// Format date
export const formatDate = (date, options = {}) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Health score helpers
export const getHealthScoreColor = (score) => {
  if (score >= 80) return "#00ff88";
  if (score >= 60) return "#00e5ff";
  if (score >= 40) return "#ffb300";
  return "#ff3d71";
};

export const getHealthScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Attention";
};

// Capitalize
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

// Symptom normalization
export const normalizeSymptoms = (input) => {
  if (Array.isArray(input)) return input;
  return input
    .split(/[,;.\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 1);
};

// AQI color
export const getAQIColor = (aqi) => {
  if (aqi <= 50) return "#00ff88";
  if (aqi <= 100) return "#ffff00";
  if (aqi <= 150) return "#ffb300";
  if (aqi <= 200) return "#ff3d71";
  return "#a78bfa";
};

// Debounce
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
