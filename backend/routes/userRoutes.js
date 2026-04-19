const express = require("express");
const router = express.Router();
const { protect } = require("../shared/middleware/auth");
const { generateToken, sendResponse, calculateHealthScore } = require("../shared/utils/helpers");
const User = require("../services/user-service/models/User");

/**
 * POST /api/users/register
 */
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, phone, age, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const user = await User.create({ name, email, password, phone, age, gender });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          role: user.role,
          healthScore: user.healthScore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/login
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          phone: user.phone,
          bloodGroup: user.bloodGroup,
          address: user.address,
          medicalHistory: user.medicalHistory,
          emergencyContact: user.emergencyContact,
          healthScore: user.healthScore,
          preferredLanguage: user.preferredLanguage,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/profile
 */
router.get("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/profile
 */
router.put("/profile", protect, async (req, res, next) => {
  try {
    const allowedFields = [
      "name", "phone", "age", "gender", "bloodGroup",
      "address", "emergencyContact", "medicalHistory",
      "preferredLanguage", "location",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: "Profile updated", data: { user } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/history
 */
router.get("/history", protect, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const user = await User.findById(req.user._id);

    const history = user.healthHistory.reverse();
    const total = history.length;
    const paginated = history.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      data: {
        history: paginated,
        total,
        page,
        pages: Math.ceil(total / limit),
        healthScore: calculateHealthScore(user.healthHistory),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/history/:id
 */
router.delete("/history/:id", protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { healthHistory: { _id: req.params.id } },
    });
    res.json({ success: true, message: "History entry removed" });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/dashboard
 */
router.get("/dashboard", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const history = user.healthHistory || [];

    const severityCounts = { MILD: 0, MODERATE: 0, EMERGENCY: 0, NORMAL: 0 };
    const last30 = [];
    const symptomMap = {};

    history.forEach((h) => {
      severityCounts[h.severity] = (severityCounts[h.severity] || 0) + 1;
      const date = new Date(h.createdAt).toISOString().split("T")[0];
      last30.push({ date, severity: h.severity, score: h.score || 0 });
      (h.symptoms || []).forEach((s) => {
        symptomMap[s] = (symptomMap[s] || 0) + 1;
      });
    });

    const topSymptoms = Object.entries(symptomMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));

    res.json({
      success: true,
      data: {
        healthScore: calculateHealthScore(history),
        totalConsultations: history.length,
        severityCounts,
        topSymptoms,
        recentActivity: history.slice(-7).reverse(),
        trends: last30.slice(-30),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/change-password
 */
router.put("/change-password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
