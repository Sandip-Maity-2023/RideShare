const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// Models for Database Queries
const Ride = require("./models/Ride");
const Vehicle = require("./models/Vehicle");

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

/* =========================================
   SOCKET.IO CONFIGURATION
========================================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

/*
   MIDDLE
========================================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

/* =========================================
   TEST ROUTE
========================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ODDO Carpooling Backend is running",
  });
});

/* =========================================
   API ROUTES
========================================= */

// Authentication (This already includes your driver-login if you updated authRoutes.js!)
app.use("/api/auth", require("./routes/authRoutes"));

// Vehicles
app.use("/api/vehicles", require("./routes/vehicleRoutes"));

// Rides (Includes /history, /search, /offer, /book, /my-trips)
app.use("/api/rides", require("./routes/rideRoutes"));

// Geocoding / Location Search
app.use("/api/geocode", require("./routes/geocodeRoutes"));

// NEW: Bookings 
//app.use("/api/bookings", require("./routes/BookingRoutes"));

// Reports & Fleet Analytics Route (Dynamic Database Calculations)
app.get("/api/reports", async (req, res) => {
  try {
    // 1. Calculate Total Fuel Cost from completed rides
    const fuelCostAgg = await Ride.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalFuel: { $sum: "$fuelCost" } } },
    ]);
    const rawFuelCost = fuelCostAgg.length > 0 ? fuelCostAgg[0].totalFuel : 0;

    // 2. Calculate Utilization Rate based on active vehicles vs total vehicles
    const totalVehiclesCount = await Vehicle.countDocuments();
    const activeVehiclesCount = await Vehicle.countDocuments({ status: "active" });
    const utilizationRateVal =
      totalVehiclesCount > 0
        ? Math.round((activeVehiclesCount / totalVehiclesCount) * 100)
        : 0;

    // 3. Top 5 Costliest Vehicles from Ride logs
    const costliestVehicles = await Ride.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$vehicleName",
          cost: { $sum: "$fuelCost" },
        },
      },
      { $sort: { cost: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: "$_id",
          cost: "$cost",
        },
      },
    ]);

    // 4. Monthly Financial Summary Aggregation
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const rawFinancials = await Ride.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$price" },
          fuelCost: { $sum: "$fuelCost" },
          maintenance: { $sum: "$maintenanceCost" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const financialSummary = rawFinancials.map((item) => {
      const rev = item.revenue || 0;
      const fuel = item.fuelCost || 0;
      const maint = item.maintenance || 0;
      const profit = rev - (fuel + maint);

      return {
        id: item._id,
        month: monthNames[item._id - 1] || `Month ${item._id}`,
        revenue: `Rs. ${rev}`,
        fuelCost: `Rs. ${fuel}`,
        maintenance: `Rs. ${maint}`,
        netProfit: `Rs. ${profit}`,
      };
    });

    // 5. Monthly Fuel Efficiency Aggregation (km/L trend)
    const rawEfficiency = await Ride.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          avgEfficiency: { $avg: "$fuelEfficiency" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const fuelEfficiency = rawEfficiency.map((item) => ({
      id: item._id,
      label: monthNames[item._id - 1] || `Month ${item._id}`,
      val: Math.round(item.avgEfficiency || 0),
    }));

    // Send Database Results
    res.status(200).json({
      success: true,
      metrics: {
        totalFuelCost: `Rs. ${rawFuelCost}`,
        fleetRoi: "+ 12.5%",
        utilizationRate: `${utilizationRateVal}%`,
      },
      fuelEfficiency,
      costliestVehicles,
      financialSummary,
    });
  } catch (err) {
    console.error("❌ Error fetching report data from database:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report metrics from database.",
    });
  }
});

/* =========================================
   SOCKET.IO - LIVE TRACKING
========================================= */

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join_trip", (tripId) => {
    if (!tripId) {
      console.log("⚠️ No tripId provided");
      return;
    }

    socket.join(tripId);

    console.log(`🚗 Socket ${socket.id} joined trip: ${tripId}`);
  });

  socket.on("update_location", ({ tripId, location }) => {
    if (!tripId || !location) {
      console.log("⚠️ Invalid location update");
      return;
    }

    console.log(`📍 Location update for trip ${tripId}:`, location);

    // Send location to everyone inside this trip
    io.to(tripId).emit("location_updated", location);
  });

  socket.on("leave_trip", (tripId) => {
    if (!tripId) return;

    socket.leave(tripId);

    console.log(`🚪 Socket ${socket.id} left trip: ${tripId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔴 Socket disconnected: ${socket.id} | Reason: ${reason}`);
  });
});

/* =========================================
   404 HANDLER
========================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================================
   ERROR HANDLER
========================================= */

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* =========================================
   START SERVER
========================================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("========================================");
  console.log("🚀 ODDO CARPOOLING BACKEND STARTED");
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO: http://localhost:${PORT}`);
  console.log("========================================");
});