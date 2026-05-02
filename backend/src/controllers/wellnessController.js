const { CheckIn, Journal, MentalAssessment } = require("../models/Wellness");
const mentalAgent = require("../services/ai-service/agents/mentalAgent");

exports.logCheckIn = async (req, res) => {
  try {
    const checkIn = await CheckIn.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: checkIn });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getWellnessStats = async (req, res) => {
  try {
    const last7Days = await CheckIn.find({ 
      user: req.user._id, 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    });

    const avgMood = last7Days.length ? (last7Days.reduce((a, b) => a + b.mood, 0) / last7Days.length).toFixed(1) : null;
    const avgStress = last7Days.length ? (last7Days.reduce((a, b) => a + b.stress, 0) / last7Days.length).toFixed(1) : null;

    res.json({
      success: true,
      data: {
        avgMood: avgMood ? `${avgMood}/5` : "—",
        checkins: last7Days.length,
        avgStress: avgStress ? `${avgStress}/5` : "—",
        stressLevel: avgStress > 3.5 ? "elevated" : avgStress > 2.5 ? "moderate" : "calm",
        history: last7Days.map(c => ({ date: c.createdAt, mood: c.mood, stress: c.stress, sleep: c.sleep }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitJournal = async (req, res) => {
  try {
    const { content } = req.body;
    const aiReflection = await mentalAgent.reflectOnJournal(content);
    const journal = await Journal.create({
      user: req.user._id,
      content,
      aiReflection
    });
    res.json({ success: true, data: journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.talkToSerene = async (req, res) => {
  try {
    const { message, history } = req.body;
    const response = await mentalAgent.talk(message, history);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateInsights = async (req, res) => {
  try {
    const last7Days = await CheckIn.find({ 
      user: req.user._id, 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    }).sort({ createdAt: 1 });

    if (last7Days.length < 2) {
      return res.status(400).json({ success: false, message: "Not enough data for patterns." });
    }

    const dataSummary = last7Days.map(c => `Date: ${c.createdAt.toISOString().split('T')[0]}, Mood: ${c.mood}/5, Stress: ${c.stress}/5, Sleep: ${c.sleep}/5`).join('\n');
    
    const insight = await mentalAgent.generateTimelineInsight(dataSummary);
    res.json({ success: true, insight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
