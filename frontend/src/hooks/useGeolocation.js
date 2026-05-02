import { useState, useCallback } from "react";

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        // Fallback to a default location (e.g. Mumbai) so the feature still works
        setLocation({ lat: 19.0760, lng: 72.8777, accuracy: 1000 });
        setError("Browser blocked location. Using default city.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { location, loading, error, getLocation };
};

export default useGeolocation;
