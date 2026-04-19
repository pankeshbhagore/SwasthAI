/**
 * SwasthAI Demo Data Seeder
 * Populates database with realistic sample users for hackathon demo
 * Run: node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./services/user-service/models/User");

const DEMO_USERS = [
  {
    name: "Rahul Sharma",
    email: "rahul@demo.com",
    password: "demo123",
    age: 34,
    gender: "male",
    bloodGroup: "B+",
    phone: "+91 98765 43210",
    address: { city: "Delhi", state: "Delhi", country: "India" },
    medicalHistory: {
      chronicConditions: ["Hypertension"],
      allergies: ["Penicillin"],
      currentMedications: ["Amlodipine 5mg"],
    },
    emergencyContact: { name: "Priya Sharma", phone: "+91 98765 43211", relation: "Wife" },
    healthHistory: [
      { symptoms: ["fever", "headache"], severity: "MILD", advice: "Rest and stay hydrated", risk: "low", emergency: false },
      { symptoms: ["chest pain", "shortness of breath"], severity: "EMERGENCY", advice: "Call 108 immediately", risk: "high", emergency: true },
      { symptoms: ["cold", "cough"], severity: "MILD", advice: "OTC medication recommended", risk: "low", emergency: false },
      { symptoms: ["high blood pressure", "dizziness"], severity: "MODERATE", advice: "Visit doctor within 24 hours", risk: "medium", emergency: false },
    ],
    healthScore: 62,
  },
  {
    name: "Priya Patel",
    email: "priya@demo.com",
    password: "demo123",
    age: 28,
    gender: "female",
    bloodGroup: "A+",
    phone: "+91 87654 32109",
    address: { city: "Mumbai", state: "Maharashtra", country: "India" },
    medicalHistory: {
      chronicConditions: ["Asthma"],
      allergies: ["Dust", "Pollen"],
      currentMedications: ["Salbutamol inhaler"],
    },
    emergencyContact: { name: "Ramesh Patel", phone: "+91 87654 32108", relation: "Father" },
    healthHistory: [
      { symptoms: ["breathing difficulty", "wheezing"], severity: "MODERATE", advice: "Use inhaler, see doctor", risk: "medium", emergency: false },
      { symptoms: ["mild fever", "sore throat"], severity: "MILD", advice: "Rest and fluids", risk: "low", emergency: false },
      { symptoms: ["skin rash", "itching"], severity: "MILD", advice: "Antihistamine recommended", risk: "low", emergency: false },
    ],
    healthScore: 78,
  },
  {
    name: "Admin User",
    email: "admin@swasthai.com",
    password: "admin123",
    age: 30,
    gender: "other",
    role: "admin",
    healthHistory: [],
    healthScore: 90,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/swasthai");
    console.log("✅ Connected to MongoDB");

    // Clear existing demo users
    await User.deleteMany({ email: { $in: DEMO_USERS.map((u) => u.email) } });
    console.log("🗑️  Cleared existing demo users");

    // Insert new demo users
    for (const userData of DEMO_USERS) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created: ${user.name} (${user.email})`);
    }

    console.log("\n🎉 Seeding complete!");
    console.log("\n📋 Demo Login Credentials:");
    console.log("  User:  rahul@demo.com / demo123");
    console.log("  User:  priya@demo.com / demo123");
    console.log("  Admin: admin@swasthai.com / admin123");

  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
