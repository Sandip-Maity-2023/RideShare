const Ride = require('../../models/Ride');
const Booking = require('../../models/Booking');

// @desc    Offer/Create a new ride
// @route   POST /api/rides
exports.createRide = async (req, res) => {
  try {
    const { vehicle, origin, destination, departureTime, availableSeats, costPerKm, totalDistanceKm } = req.body;

    const ride = await Ride.create({
      driver: req.user._id,
      vehicle,
      origin,
      destination,
      departureTime,
      availableSeats,
      costPerKm,
      totalDistanceKm,
    });

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search available rides
// @route   GET /api/rides
exports.getRides = async (req, res) => {
  try {
    const { origin, destination } = req.query;
    let filter = { status: 'Scheduled', availableSeats: { $gt: 0 } };

    if (origin) filter.origin = new RegExp(origin, 'i');
    if (destination) filter.destination = new RegExp(destination, 'i');

    const rides = await Ride.find(filter)
      .populate('driver', 'name email')
      .populate('vehicle', 'model registrationNumber');

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book seats on a ride
// @route   POST /api/rides/:id/book
exports.bookRide = async (req, res) => {
  try {
    const { seatsBooked, pickupLocation, dropoffLocation, totalCost } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.availableSeats < seatsBooked) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const booking = await Booking.create({
      ride: ride._id,
      passenger: req.user._id,
      seatsBooked,
      pickupLocation,
      dropoffLocation,
      totalCost,
      status: 'Confirmed',
    });

    ride.availableSeats -= seatsBooked;
    await ride.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
