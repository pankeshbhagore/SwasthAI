const User = require("../models/User");
const { generateToken, calculateHealthScore, sendResponse } = require("../utils/helpers");

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, age, gender, role, specialization, degree } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      age,
      gender,
      role: role || "user",
      doctorInfo: role === "doctor" ? { specialization, degree } : undefined,
    });
    const token = generateToken(user._id);

    return sendResponse(res, 201, true, "Account created successfully", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
        healthScore: user.healthScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
exports.loginUser = async (req, res, next) => {
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

    return sendResponse(res, 200, true, "Login successful", {
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
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("familyDoctor", "name email doctorInfo profilePicture");
    return sendResponse(res, 200, true, "Profile retrieved", { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name", "phone", "age", "gender", "bloodGroup",
      "address", "emergencyContact", "medicalHistory",
      "preferredLanguage", "location", "doctorInfo"
    ];

    const updates = {};
    const $unset = {};
    
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Handle empty strings for enums and numbers to prevent Mongoose validation errors
        if (req.body[field] === "" && (field === "gender" || field === "bloodGroup" || field === "age")) {
          $unset[field] = 1;
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const updateQuery = { $set: updates };
    if (Object.keys($unset).length > 0) {
      updateQuery.$unset = $unset;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateQuery, {
      new: true,
      runValidators: true,
    }).populate("familyDoctor", "name email doctorInfo profilePicture");

    return sendResponse(res, 200, true, "Profile updated", { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user health history
 * @route   GET /api/users/history
 * @access  Private
 */
exports.getUserHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const user = await User.findById(req.user._id);

    const history = [...user.healthHistory].reverse();
    const total = history.length;
    const paginated = history.slice((page - 1) * limit, page * limit);

    return sendResponse(res, 200, true, "History retrieved", {
      history: paginated,
      total,
      page,
      pages: Math.ceil(total / limit),
      healthScore: calculateHealthScore(user.healthHistory),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user dashboard data
 * @route   GET /api/users/dashboard
 * @access  Private
 */
exports.getUserDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const history = user.healthHistory || [];

    const severityCounts = { MILD: 0, MODERATE: 0, EMERGENCY: 0, NORMAL: 0 };
    const last30 = [];
    const symptomMap = {};
    const conditionMap = {};

    history.forEach((h, index) => {
      severityCounts[h.severity] = (severityCounts[h.severity] || 0) + 1;
      const date = new Date(h.createdAt).toISOString().split("T")[0];
      const historicalScore = calculateHealthScore(history.slice(0, index + 1));
      last30.push({ date, severity: h.severity, score: historicalScore });
      
      (h.symptoms || []).forEach((s) => {
        symptomMap[s] = (symptomMap[s] || 0) + 1;
      });

      (h.conditions || []).forEach((c) => {
        conditionMap[c] = (conditionMap[c] || 0) + 1;
      });
    });

    const topSymptoms = Object.entries(symptomMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));

    const topConditions = Object.entries(conditionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([condition, count]) => ({ condition, count }));

    const currentScore = calculateHealthScore(history);
    
    // Sync the score to the user model if it has changed
    if (user.healthScore !== currentScore) {
      user.healthScore = currentScore;
      await user.save();
    }

    return sendResponse(res, 200, true, "Dashboard data retrieved", {
      healthScore: currentScore,
      totalConsultations: history.length,
      severityCounts,
      topSymptoms,
      topConditions,
      recentActivity: [...history].slice(-7).reverse(),
      trends: last30.slice(-30),
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Delete health history entry
 * @route   DELETE /api/users/history/:id
 * @access  Private
 */
exports.deleteHistoryEntry = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { healthHistory: { _id: req.params.id } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return sendResponse(res, 200, true, "History entry removed", {
      healthScore: calculateHealthScore(user.healthHistory),
    });
  } catch (error) {
    next(error);
  }
};
