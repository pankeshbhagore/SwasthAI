const express = require("express");
const router = express.Router();
const { protect } = require("../shared/middleware/auth");
const User = require("../services/user-service/models/User");

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

/**
 * GET /api/admin/stats
 * High-level platform statistics for admin view
 */
router.get("/stats", protect, adminOnly, async (req, res, next) => {
  try {
    const [totalUsers, usersToday] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    // Aggregate severity counts across all users
    const severityPipeline = await User.aggregate([
      { $unwind: "$healthHistory" },
      { $group: { _id: "$healthHistory.severity", count: { $sum: 1 } } },
    ]);

    const severityCounts = {};
    severityPipeline.forEach(({ _id, count }) => {
      severityCounts[_id] = count;
    });

    // Top symptoms across platform
    const topSymptomsPipeline = await User.aggregate([
      { $unwind: "$healthHistory" },
      { $unwind: "$healthHistory.symptoms" },
      { $group: { _id: "$healthHistory.symptoms", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const totalConsultations = Object.values(severityCounts).reduce((a, b) => a + b, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        usersToday,
        totalConsultations,
        emergenciesDetected: severityCounts.EMERGENCY || 0,
        severityCounts,
        topSymptoms: topSymptomsPipeline.map(({ _id, count }) => ({ symptom: _id, count })),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/users
 * Paginated list of users (admin only)
 */
router.get("/users", protect, adminOnly, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}, "name email age gender healthScore createdAt lastLogin role isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { users, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/recent-emergencies
 * Recent emergency cases
 */
router.get("/recent-emergencies", protect, adminOnly, async (req, res, next) => {
  try {
    const pipeline = await User.aggregate([
      { $unwind: "$healthHistory" },
      { $match: { "healthHistory.severity": "EMERGENCY" } },
      { $sort: { "healthHistory.createdAt": -1 } },
      { $limit: 20 },
      {
        $project: {
          name: 1,
          email: 1,
          "healthHistory.symptoms": 1,
          "healthHistory.severity": 1,
          "healthHistory.createdAt": 1,
          "healthHistory.advice": 1,
        },
      },
    ]);

    res.json({ success: true, data: pipeline });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
