import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

/**
 * useAQI — Fetches Air Quality Index and weather health advisories
 */
const useAQI = (city = "delhi", lat = null, lng = null) => {
  const [aqi, setAqi] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAQI = useCallback(async (cityName = city, latitude = lat, longitude = lng) => {
    setLoading(true);
    try {
      const params = { city: cityName };
      if (latitude && longitude) {
        params.lat = latitude;
        params.lng = longitude;
      }
      const [aqiRes] = await Promise.allSettled([
        api.get("/alerts/aqi", { params }),
      ]);
      if (aqiRes.status === "fulfilled") {
        setAqi(aqiRes.value.data.data);
      }
    } catch {
      // silently fail — AQI is supplementary info
    } finally {
      setLoading(false);
    }
  }, [city, lat, lng]);

  const fetchWeather = useCallback(async (latitude = lat, longitude = lng) => {
    if (!latitude || !longitude) return;
    try {
      const res = await api.get("/alerts/weather", { params: { lat: latitude, lng: longitude } });
      setWeather(res.data.data);
    } catch {
      // silently fail
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchAQI();
    if (lat && lng) {
      fetchWeather();
    }
  }, [fetchAQI, fetchWeather, lat, lng]);

  return { aqi, weather, loading, fetchAQI, fetchWeather };
};

export default useAQI;
