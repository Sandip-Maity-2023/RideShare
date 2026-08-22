const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

// 1. User requests a ride
exports.requestRide = async (req, res) => {
  try {
    const { rideId, passengerId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride || ride.availableSeats <= 0) {
      return res.status(400).json({ error: 'Ride is unavailable or full' });
    }

    const newBooking = new Booking({ ride: rideId, passenger: passengerId });
    await newBooking.save();
    
    res.status(201).json({ message: 'Booking requested successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. Driver views pending requests
exports.getDriverRequests = async (req, res) => {
  try {
    const driverRides = await Ride.find({ driver: req.params.driverId }).select('_id');
    const rideIds = driverRides.map(ride => ride._id);

    const requests = await Booking.find({ ride: { $in: rideIds }, status: 'Pending' })
      .populate('passenger', 'name email phone')
      .populate('ride', 'pickupLocation destination date time');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3. Driver accepts a request
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const ride = await Ride.findById(booking.ride);
    if (ride.availableSeats <= 0) {
      return res.status(400).json({ error: 'No available seats left' });
    }

    // Update booking and ride
    booking.status = 'Accepted';
    await booking.save();

    ride.passengers.push(booking.passenger);
    ride.availableSeats -= 1;
    if (ride.availableSeats === 0) ride.status = 'Booked';
    await ride.save();

    res.json({ message: 'Booking accepted', booking, ride });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4. User views their own bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.params.userId })
      .populate({
        path: 'ride',
        populate: { path: 'driver', select: 'name phone' }
      });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};