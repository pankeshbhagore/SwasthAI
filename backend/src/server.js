require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");
const mapRoutes = require("./routes/mapRoutes");
const alertRoutes = require("./routes/alertRoutes");
const triageRoutes = require("./routes/triageRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const advancedRoutes = require("./routes/advancedRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const wellnessRoutes = require("./routes/wellnessRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://swasthai-gd1s.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Connect to database
connectDB();

// Security middleware
// 1. Move CORS to the very top after body parsing (or even before)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes("onrender.com")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 1000 : 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security middleware (Helmet must come AFTER CORS sometimes or be configured carefully)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static files (for uploaded reports)
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "MediMind API Gateway",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ── Smart Routing Middleware ──
// Automatically handle requests with typos like /api1, /api/ (trailing slash), or missing /api prefix
app.use((req, res, next) => {
  const commonRoutes = ["/users", "/ai", "/maps", "/alerts", "/triage", "/reports", "/admin", "/advanced", "/chatbot", "/wellness", "/doctors", "/chat"];
  
  // 1. Handle missing /api prefix
  if (commonRoutes.some(route => req.url.startsWith(route)) && !req.url.startsWith("/api/")) {
    req.url = `/api${req.url}`;
  }
  
  // 2. Handle typos like /api1, /api2, etc. (common typo on Render dashboard)
  if (req.url.startsWith("/api") && !req.url.startsWith("/api/")) {
    req.url = req.url.replace(/^\/api[^\/]*/, "/api");
  }

  next();
});

// API Routes
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/maps", mapRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/triage", triageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/advanced", advancedRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/chat", chatRoutes);

// Socket.IO — Real-time features
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on("join-room", async (userId) => {
    socket.join(userId);
    socket.userId = userId; // Store for disconnect
    console.log(`User ${userId} joined their room`);
    
    // Update online status
    const User = require("./models/User");
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    } catch (err) {
      console.error("Failed to update status on join");
    }
  });

  socket.on("emergency-trigger", async (data) => {
    console.log("🚨 Emergency triggered:", data);
    io.to(data.userId).emit("emergency-response", {
      message: "Emergency services alerted. Help is on the way.",
      timestamp: new Date().toISOString(),
    });
    // Broadcast to admin room
    io.to("admin").emit("new-emergency", data);
  });

  // Call Signaling
  socket.on("call-user", ({ to, from, signalData, type, fromName }) => {
    console.log(`📞 Call initiated from ${from} to ${to} (${type})`);
    io.to(to).emit("incoming-call", { from, signalData, type, fromName });
  });

  socket.on("answer-call", ({ to, signal }) => {
    console.log(`✅ Call answered for ${to}`);
    io.to(to).emit("call-accepted", signal);
  });

  socket.on("end-call", ({ to }) => {
    console.log(`❌ Call ended for ${to}`);
    io.to(to).emit("call-ended");
  });

  socket.on("disconnect", async () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    if (socket.userId) {
      const User = require("./models/User");
      try {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
      } catch (err) {
        console.error("Failed to update status on disconnect");
      }
    }
  });
});

// Make io accessible to routes
app.set("io", io);

// Global error handler
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const setupCronJobs = require("./utils/cron");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 MediMind Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Socket.IO enabled`);
  setupCronJobs();
});

module.exports = { app, io };
