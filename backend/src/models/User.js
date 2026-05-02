const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const healthHistorySchema = new mongoose.Schema({
  symptoms: [String],
  severity: {
    type: String,
    enum: ["MILD", "MODERATE", "EMERGENCY", "NORMAL"],
    default: "NORMAL",
  },
  conditions: [String],
  advice: String,
  risk: String,
  emergency: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: { type: String, trim: true },
    age: { type: Number, min: 0, max: 150 },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    address: {
      city: String,
      state: String,
      country: { type: String, default: "India" },
      pincode: String,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    medicalHistory: {
      allergies: [String],
      chronicConditions: [String],
      currentMedications: [String],
      pastSurgeries: [String],
    },
    healthHistory: [healthHistorySchema],
    healthScore: { type: Number, default: 75, min: 0, max: 100 },
    preferredLanguage: { type: String, default: "en" },
    role: {
      type: String,
      enum: ["user", "admin", "doctor"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    profilePicture: String,
    // Doctor Specific
    doctorInfo: {
      specialization: String,
      experience: Number,
      hospital: String,
      degree: String,
      isVerified: { type: Boolean, default: false },
      availability: String,
    },
    // Connections
    familyDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.index({ name: "text" });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get recent health history
userSchema.methods.getRecentHistory = function (limit = 10) {
  return this.healthHistory.slice(-limit);
};

module.exports = mongoose.model("User", userSchema);
