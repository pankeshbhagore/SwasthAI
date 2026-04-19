import { useState, useCallback } from "react";
import api from "../utils/api";
import { normalizeSymptoms } from "../utils/helpers";
import toast from "react-hot-toast";

/**
 * useHealth — centralized hook for all health analysis operations
 */
const useHealth = () => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Run full multi-agent analysis
   */
  const analyzeSymptoms = useCallback(async ({ symptoms, age, medicalHistory, location, language }) => {
    const normalized = Array.isArray(symptoms)
      ? symptoms
      : normalizeSymptoms(symptoms);

    if (!normalized.length) {
      toast.error("Please provide at least one symptom.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/ai/analyze", {
        symptoms: normalized,
        age,
        medicalHistory: medicalHistory || [],
        location: location || null,
        language: language || "en",
      });

      const data = res.data.data;
      setAnalysisResult(data);

      if (data.triage?.emergency) {
        toast.error("🚨 Emergency detected! Call 108 immediately.", {
          duration: 8000,
          id: "emergency-toast",
        });
      } else {
        toast.success("Analysis complete!");
      }

      return data;
    } catch (err) {
      const msg = err.message || "Analysis failed. Please try again.";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Quick offline triage (no API)
   */
  const quickTriage = useCallback(async (symptoms, age) => {
    setLoading(true);
    try {
      const res = await api.post("/triage/quick", { symptoms, age });
      return res.data.data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Predict health risks based on full profile
   */
  const predictRisk = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/risk-prediction");
      setRiskResult(res.data.data);
      return res.data.data;
    } catch (err) {
      toast.error("Risk prediction failed.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch health score
   */
  const getHealthScore = useCallback(async () => {
    try {
      const res = await api.get("/ai/health-score");
      return res.data.data;
    } catch {
      return null;
    }
  }, []);

  /**
   * Trigger emergency alert
   */
  const triggerEmergency = useCallback(async (symptoms, location) => {
    setLoading(true);
    try {
      const res = await api.post("/alerts/emergency", { symptoms, location });
      toast.success("Emergency alert sent to your emergency contact!", { duration: 5000 });
      return res.data.data;
    } catch (err) {
      toast.error("Could not send emergency alert. Please call 108 directly.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setAnalysisResult(null);
    setRiskResult(null);
    setError(null);
  }, []);

  return {
    loading,
    analysisResult,
    riskResult,
    error,
    analyzeSymptoms,
    quickTriage,
    predictRisk,
    getHealthScore,
    triggerEmergency,
    clearResults,
  };
};

export default useHealth;
