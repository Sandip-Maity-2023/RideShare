const express = require("express");
const axios = require("axios");

const router = express.Router();

/*
  GET /api/geocode/search?q=Iskcon
*/

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    // Don't search for very short queries
    if (!q || q.trim().length < 3) {
      return res.json([]);
    }

    console.log("🔍 Location search:", q);

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: q.trim(),
          format: "json",
          addressdetails: 1,
          limit: 5,
          countrycodes: "in",
        },

        headers: {
          "User-Agent": "ODDO-Carpooling-App/1.0",
          Accept: "application/json",
        },

        timeout: 10000,
      }
    );

    console.log(
      `✅ Found ${response.data?.length || 0} locations`
    );

    res.status(200).json(response.data || []);
  } catch (error) {
    console.error(
      "❌ Geocoding error:",
      error.response?.status,
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Location search failed",
    });
  }
});

module.exports = router;