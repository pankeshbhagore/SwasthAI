const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Message = require("../models/Message");
const User = require("../models/User");

// Get messages between two users
router.get("/:otherUserId", protect, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    console.log(`💬 Fetching chat between ${req.user._id} and ${otherUserId}`);
    
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("❌ Chat Fetch Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send a message
router.post("/", protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text
    });
    
    // Notify via socket if possible
    const io = req.app.get("io");
    if (io) {
      io.to(receiverId).emit("new-message", message);
    }
    
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
