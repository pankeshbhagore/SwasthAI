const axios = require("axios");

/**
 * Hospital Agent - Finds nearby hospitals based on location and severity
 */
class HospitalAgent {
  constructor() {
    this.name = "HospitalAgent";
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  async findNearbyHospitals(lat, lng, severity = "MILD", radius = 5000) {
    // Adjust radius based on severity
    const searchRadius = severity === "EMERGENCY" ? 3000 : severity === "MODERATE" ? 5000 : 10000;
    const type = severity === "EMERGENCY" ? "hospital" : "hospital|doctor|clinic";

    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
      const response = await axios.get(url, {
        params: {
          location: `${lat},${lng}`,
          radius: searchRadius,
          type,
          key: this.apiKey,
        },
      });

      if (response.data.status !== "OK") {
        return this._getFallbackHospitals(lat, lng);
      }

      const hospitals = response.data.results.slice(0, 8).map((place) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        rating: place.rating || 0,
        isOpen: place.opening_hours?.open_now,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        types: place.types,
        userRatingsTotal: place.user_ratings_total || 0,
        isEmergency: this._checkEmergencyCapability(place),
        distanceKm: this._calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
      }));

      // Sort by relevance (emergency capable first for emergencies, then by distance)
      if (severity === "EMERGENCY") {
        hospitals.sort((a, b) => (b.isEmergency - a.isEmergency) || (a.distanceKm - b.distanceKm));
      } else {
        hospitals.sort((a, b) => a.distanceKm - b.distanceKm);
      }

      const locationName = await this.getLocationName(lat, lng);
      return { agent: this.name, hospitals, total: hospitals.length, searchRadius, locationName };
    } catch (error) {
      console.error("Hospital Agent error:", error.message);
      return this._getFallbackHospitals(lat, lng);
    }
  }

  async getLocationName(lat, lng) {
    try {
      if (!this.apiKey) return null;
      const url = `https://maps.googleapis.com/maps/api/geocode/json`;
      const response = await axios.get(url, {
        params: { latlng: `${lat},${lng}`, key: this.apiKey }
      });
      if (response.data.status === "OK" && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
    } catch (e) {
      // silently fail
    }
    return null;
  }

  async getHospitalDetails(placeId) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json`;
      const response = await axios.get(url, {
        params: {
          place_id: placeId,
          fields: "name,formatted_address,formatted_phone_number,opening_hours,rating,website,geometry",
          key: this.apiKey,
        },
      });

      return response.data.result;
    } catch (error) {
      console.error("Hospital details error:", error.message);
      return null;
    }
  }

  _checkEmergencyCapability(place) {
    const emergencyKeywords = ["hospital", "emergency", "trauma", "medical center"];
    const name = place.name.toLowerCase();
    return emergencyKeywords.some((kw) => name.includes(kw)) || 
           place.types?.includes("hospital");
  }

  _calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  _getFallbackHospitals(lat, lng) {
    // Return demo data when API is not available
    return {
      agent: this.name,
      hospitals: [
        {
          id: "demo_1",
          name: "City Government Hospital",
          address: "Near your location",
          rating: 4.2,
          isOpen: true,
          lat: lat + 0.01,
          lng: lng + 0.01,
          isEmergency: true,
          distanceKm: 1.2,
        },
        {
          id: "demo_2",
          name: "Primary Health Centre",
          address: "Nearby",
          rating: 3.8,
          isOpen: true,
          lat: lat - 0.01,
          lng: lng + 0.02,
          isEmergency: false,
          distanceKm: 2.1,
        },
      ],
      total: 2,
      demo: true,
      locationName: "Demo Location (Fallback)",
    };
  }
}

module.exports = new HospitalAgent();
