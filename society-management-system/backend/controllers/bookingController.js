const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Amenity = require('../models/Amenity');

const getBookings = asyncHandler(async (req, res) => {
  const filter = { society: req.user.society };
  if (req.user.role === 'resident') filter.bookedBy = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.amenityId) filter.amenity = req.query.amenityId;

  const bookings = await Booking.find(filter)
    .populate('amenity', 'name pricePerHour')
    .populate('bookedBy', 'name email phone')
    .sort({ date: -1 });

  res.json({ success: true, count: bookings.length, bookings });
});

const createBooking = asyncHandler(async (req, res) => {
  const { amenity, date, startTime, endTime, notes } = req.body;

  const amenityDoc = await Amenity.findOne({ _id: amenity, society: req.user.society });
  if (!amenityDoc) {
    res.status(404);
    throw new Error('Amenity not found');
  }

  const overlap = await Booking.findOne({
    amenity,
    society: req.user.society,
    date: new Date(date),
    status: { $in: ['pending', 'approved'] },
    $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
  });

  if (overlap) {
    res.status(400);
    throw new Error('This amenity is already booked for the selected time slot');
  }

  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);
  const hours = Math.max(endHour - startHour, 1);

  const booking = await Booking.create({
    amenity,
    bookedBy: req.user._id,
    date,
    startTime,
    endTime,
    notes,
    totalCost: hours * amenityDoc.pricePerHour,
    society: req.user.society,
  });

  res.status(201).json({ success: true, booking });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, society: req.user.society });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  booking.status = req.body.status || booking.status;
  await booking.save();
  res.json({ success: true, booking });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, society: req.user.society });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (req.user.role === 'resident' && booking.bookedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }
  booking.status = 'cancelled';
  await booking.save();
  res.json({ success: true, booking });
});

module.exports = { getBookings, createBooking, updateBookingStatus, cancelBooking };
