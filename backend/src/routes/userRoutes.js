const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserHistory,
  getUserDashboard,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { validateRegister, validateLogin, validateProfileUpdate } = require("../middleware/validator");

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, validateProfileUpdate, updateUserProfile);
router.get("/history", protect, getUserHistory);
router.get("/dashboard", protect, getUserDashboard);

module.exports = router;
