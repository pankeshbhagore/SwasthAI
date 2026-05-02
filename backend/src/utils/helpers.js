const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Format API response
const sendResponse = (res, statusCode, success, message, data = {}) => {
  return res.status(statusCode).json({
    success,
    message,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Calculate health score (0-100)
const calculateHealthScore = (history) => {
  if (!history || history.length === 0) return 75;
  
  // Create a copy before slicing to avoid mutation issues
  const recent = [...history].slice(-10);
  let score = 100;
  
  recent.forEach((entry) => {
    if (entry.severity === "EMERGENCY") score -= 15;
    else if (entry.severity === "MODERATE") score -= 7;
    else if (entry.severity === "MILD") score -= 2;
  });
  
  // Baseline score of 25 for any active user who has at least some data
  return Math.max(25, Math.min(100, score));
};

// Get severity color
const getSeverityColor = (severity) => {
  const colors = {
    EMERGENCY: "#ef4444",
    MODERATE: "#f59e0b",
    MILD: "#22c55e",
    NORMAL: "#3b82f6",
  };
  return colors[severity] || colors.NORMAL;
};

// Encrypt sensitive data
const encryptData = (data) => {
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(process.env.JWT_SECRET || "fallback", "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

// Decrypt sensitive data
const decryptData = (encryptedData) => {
  try {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(process.env.JWT_SECRET || "fallback", "salt", 32);
    const [ivHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};

// Paginate results
const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

module.exports = {
  generateToken,
  sendResponse,
  calculateHealthScore,
  getSeverityColor,
  encryptData,
  decryptData,
  paginate,
};
