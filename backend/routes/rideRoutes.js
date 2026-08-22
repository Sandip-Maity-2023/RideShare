const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const router = express.Router();

// Helper to remove expired rides automatically
const cleanupExpiredRides = async () => {
  try {
    const now = new Date();
    
    // Find published rides and remove those whose scheduled departure is in the past
    const publishedRides = await Ride.find({ status: 'Published' });
    const expiredIds = publishedRides
      .filter((ride) => {
        if (!ride.date || !ride.time) return false;
        const rideDateTime = new Date(`${ride.date}T${ride.time}`);
        return rideDateTime < now;
      })
      .map((ride) => ride._id);

    if (expiredIds.length > 0) {
      await Ride.deleteMany({ _id: { $in: expiredIds } });
    }
  } catch (err) {
    console.error('Error cleaning up expired rides:', err);
  }
};

// Helper handler to create/publish a ride
const handlePublishRide = async (req, res) => {
  try {
    const { 
      driverId, 
      vehicleId, 
      pickupLocation, 
      destination, 
      dropLocation, 
      date, 
      time, 
      dateTime,     
      availableSeats, 
      seats,        
      fare, 
      price,
      carDetails 
    } = req.body;

    let validDriverId = driverId;

    // IF DRIVER ID IS MISSING, FIND ANY EXISTING USER OR CREATE DEFAULT
    if (!validDriverId) {
      let existingUser = await User.findOne();
      if (!existingUser) {
        existingUser = new User({
          name: 'User',
          email: 'user@example.com',
          password: 'hashedpassword123'
        });
        await existingUser.save();
      }
      validDriverId = existingUser._id;
    }

    const rideDate = date || (dateTime ? dateTime.split('T')[0] : new Date().toISOString().split('T')[0]);
    const rideTime = time || (dateTime ? dateTime.split('T')[1] : '12:00');

    const ride = new Ride({
      driver: validDriverId,
      vehicle: vehicleId || null,
      carDetails: carDetails || {},
      pickupLocation: pickupLocation,
      destination: destination || dropLocation,
      date: rideDate,
      time: rideTime,
      availableSeats: availableSeats !== undefined ? availableSeats : (seats || 1),
      fare: fare !== undefined ? fare : (price || 0),
      status: 'Published'
    });

    await ride.save();
    res.status(201).json({ message: 'Ride published successfully', ride });
  } catch (err) {
    console.error('Error publishing ride:', err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// RIDE HISTORY ENDPOINTS (MUST BE ABOVE /:id)
// ==========================================

// 1. GET ALL COMPLETED / PAST RIDE HISTORY
router.get('/history', async (req, res) => {
  try {
    const now = new Date();

    // Query rides marked as Completed, or past rides
    const rides = await Ride.find({
      $or: [
        { status: 'Completed' },
        { status: 'Finished' },
        { status: 'Booked' }
      ]
    })
      .populate('driver', 'name email')
      .populate('vehicle')
      .sort({ createdAt: -1 });

    // Normalize formatting for frontend response
    const formattedHistory = rides.map((ride) => {
      const driverName = ride.driver?.name || 'Driver';
      const route = `${ride.pickupLocation || 'Pickup'} to ${ride.destination || 'Destination'}`;
      
      const plateNumber =
        ride.vehicle?.plateNumber ||
        ride.vehicle?.registrationNumber ||
        ride.carDetails?.plateNumber ||
        ride.carDetails?.registrationNumber ||
        'N/A';

      const dateTime = ride.date && ride.time 
        ? `${ride.time} ${ride.date}` 
        : new Date(ride.createdAt).toLocaleString();

      return {
        _id: ride._id,
        driverName,
        route,
        plateNumber,
        dateTime,
        pickupLocation: ride.pickupLocation,
        destination: ride.destination,
        fare: ride.fare,
        status: ride.status,
        createdAt: ride.createdAt
      };
    });

    res.json(formattedHistory);
  } catch (err) {
    console.error('Error fetching ride history:', err);
    res.status(500).json({ message: err.message });
  }
});

// 2. GET USER SPECIFIC RIDE HISTORY
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const rides = await Ride.find({
      $and: [
        { $or: [{ driver: userId }, { passengers: userId }] },
        { $or: [{ status: 'Completed' }, { status: 'Finished' }, { status: 'Booked' }] }
      ]
    })
      .populate('driver', 'name email')
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    console.error('Error fetching user ride history:', err);
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// OTHER RIDE ENDPOINTS
// ==========================================

// PUBLISH / OFFER RIDE
router.post('/offer', handlePublishRide);
router.post('/publish', handlePublishRide);

// SEARCH RIDES
router.post('/search', async (req, res) => {
  try {
    await cleanupExpiredRides();

    const { pickupLocation, destination, dropLocation } = req.body;
    const targetDestination = destination || dropLocation;

    const query = { status: 'Published' };

    if (pickupLocation) {
      query.pickupLocation = new RegExp(pickupLocation, 'i');
    }
    if (targetDestination) {
      query.destination = new RegExp(targetDestination, 'i');
    }

    const rides = await Ride.find(query)
      .populate('driver', 'name email')
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL PUBLISHED RIDES
router.get('/', async (req, res) => {
  try {
    await cleanupExpiredRides();

    const rides = await Ride.find({ status: 'Published' })
      .populate('driver', 'name email')
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. BOOK RIDE WITH WALLET FARE DEDUCTION
router.post('/book', async (req, res) => {
  try {
    const { rideId, passengerId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    // Find passenger to verify and deduct wallet balance
    const passenger = await User.findById(passengerId);
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger user not found' });
    }

    const fareAmount = Number(ride.fare) || 0;

    // Verify sufficient balance
    if (passenger.walletBalance < fareAmount) {
      return res.status(400).json({
        message: `Insufficient wallet balance! Current balance: ₹${passenger.walletBalance}, Fare: ₹${fareAmount}`
      });
    }

    // Deduct fare from passenger's wallet
    passenger.walletBalance -= fareAmount;
    await passenger.save();

    // Credit driver's wallet balance if driver exists
    if (ride.driver) {
      await User.findByIdAndUpdate(ride.driver, {
        $inc: { walletBalance: fareAmount }
      });
    }

    // Update ride passenger list and seats
    ride.passengers.push(passengerId);
    ride.availableSeats -= 1;
    if (ride.availableSeats === 0) {
      ride.status = 'Booked';
    }
    await ride.save();

    res.json({
      message: 'Ride booked and fare deducted successfully!',
      remainingBalance: passenger.walletBalance,
      ride
    });
  } catch (err) {
    console.error('Error booking ride:', err);
    res.status(500).json({ message: err.message });
  }
});

// MY TRIPS
router.get('/my-trips/:userId', async (req, res) => {
  try {
    const rides = await Ride.find({
      $or: [{ driver: req.params.userId }, { passengers: req.params.userId }]
    })
      .populate('driver', 'name email')
      .populate('vehicle');

    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;