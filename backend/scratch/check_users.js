const mongoose = require("mongoose");
const User = require("../src/models/User");
const dotenv = require("dotenv");

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    const users = await User.find({}, "name email");
    console.log("Found users:", users.length);
    users.forEach(u => console.log(`- ${u.name} (${u.email})`));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

checkUsers();
