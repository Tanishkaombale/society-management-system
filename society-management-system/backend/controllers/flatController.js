const asyncHandler = require('express-async-handler');
const Flat = require('../models/Flat');
const User = require('../models/User');

// @desc    Get all flats in the current user's society
// @route   GET /api/flats
// @access  Private
const getFlats = asyncHandler(async (req, res) => {
  const { block, status, search } = req.query;
  const filter = { society: req.user.society };
  if (block) filter.block = block;
  if (status) filter.status = status;
  if (search) filter.flatNumber = { $regex: search, $options: 'i' };

  const flats = await Flat.find(filter)
    .populate('owner', 'name email phone')
    .populate('members', 'name email phone')
    .sort({ block: 1, flatNumber: 1 });

  res.json({ success: true, count: flats.length, flats });
});

// @desc    Get single flat
// @route   GET /api/flats/:id
// @access  Private
const getFlat = asyncHandler(async (req, res) => {
  const flat = await Flat.findOne({ _id: req.params.id, society: req.user.society })
    .populate('owner', 'name email phone')
    .populate('members', 'name email phone');
  if (!flat) {
    res.status(404);
    throw new Error('Flat not found');
  }
  res.json({ success: true, flat });
});

// @desc    Create a flat
// @route   POST /api/flats
// @access  Private/Admin
const createFlat = asyncHandler(async (req, res) => {
  const flat = await Flat.create({ ...req.body, society: req.user.society });
  res.status(201).json({ success: true, flat });
});

// @desc    Update a flat
// @route   PUT /api/flats/:id
// @access  Private/Admin
const updateFlat = asyncHandler(async (req, res) => {
  const flat = await Flat.findOne({ _id: req.params.id, society: req.user.society });
  if (!flat) {
    res.status(404);
    throw new Error('Flat not found');
  }
  const { society, ...updates } = req.body;
  Object.assign(flat, updates);
  const updated = await flat.save();
  res.json({ success: true, flat: updated });
});

// @desc    Delete a flat
// @route   DELETE /api/flats/:id
// @access  Private/Admin
const deleteFlat = asyncHandler(async (req, res) => {
  const flat = await Flat.findOne({ _id: req.params.id, society: req.user.society });
  if (!flat) {
    res.status(404);
    throw new Error('Flat not found');
  }
  await User.updateMany({ flat: flat._id }, { $set: { flat: null } });
  await flat.deleteOne();
  res.json({ success: true, message: 'Flat removed successfully' });
});

module.exports = { getFlats, getFlat, createFlat, updateFlat, deleteFlat };
