import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

/**
 * useAQI — Fetches Air Quality Index and weather health advisories
 */
const useAQI = (city = "delhi") => {
  const [aqi, setAqi] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAQI = useCallback(async (cityName = city) => {
    setLoading(true);
    try {
      const [aqiRes] = await Promise.allSettled([
        api.get("/alerts/aqi", { params: { city: cityName } }),
      ]);
      if (aqiRes.status === "fulfilled") {
        setAqi(aqiRes.value.data.data);
      }
    } catch {
      // silently fail — AQI is supplementary info
    } finally {
      setLoading(false);
    }
  }, [city]);

  const fetchWeather = useCallback(async (lat, lng) => {
    try {
      const res = await api.get("/alerts/weather", { params: { lat, lng } });
      setWeather(res.data.data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchAQI();
  }, [fetchAQI]);

  return { aqi, weather, loading, fetchAQI, fetchWeather };
};

export default useAQI;
