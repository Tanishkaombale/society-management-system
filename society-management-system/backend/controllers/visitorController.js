const asyncHandler = require('express-async-handler');
const Visitor = require('../models/Visitor');

// @desc    Get visitors in the current user's society
// @route   GET /api/visitors
// @access  Private
const getVisitors = asyncHandler(async (req, res) => {
  const { status, flatId } = req.query;
  const filter = { society: req.user.society };
  if (status) filter.status = status;
  if (flatId) filter.flatToVisit = flatId;

  if (req.user.role === 'resident' && req.user.flat) {
    filter.flatToVisit = req.user.flat;
  }

  const visitors = await Visitor.find(filter)
    .populate('flatToVisit', 'flatNumber block')
    .populate('hostResident', 'name phone')
    .populate('addedBy', 'name role')
    .sort({ entryTime: -1 });

  res.json({ success: true, count: visitors.length, visitors });
});

// @desc    Get single visitor
// @route   GET /api/visitors/:id
// @access  Private
const getVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOne({ _id: req.params.id, society: req.user.society })
    .populate('flatToVisit', 'flatNumber block')
    .populate('hostResident', 'name phone')
    .populate('addedBy', 'name role');
  if (!visitor) {
    res.status(404);
    throw new Error('Visitor record not found');
  }
  res.json({ success: true, visitor });
});

// @desc    Log a new visitor entry (security/admin)
// @route   POST /api/visitors
// @access  Private/Admin/Security
const createVisitor = asyncHandler(async (req, res) => {
  const { name, phone, purpose, flatToVisit, hostResident, vehicleNumber } = req.body;
  const visitor = await Visitor.create({
    name,
    phone,
    purpose,
    flatToVisit,
    hostResident: hostResident || null,
    vehicleNumber,
    addedBy: req.user._id,
    society: req.user.society,
  });
  res.status(201).json({ success: true, visitor });
});

// @desc    Mark visitor as checked out
// @route   PUT /api/visitors/:id/checkout
// @access  Private/Admin/Security
const checkoutVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOne({ _id: req.params.id, society: req.user.society });
  if (!visitor) {
    res.status(404);
    throw new Error('Visitor record not found');
  }
  visitor.status = 'checked-out';
  visitor.exitTime = new Date();
  await visitor.save();
  res.json({ success: true, visitor });
});

// @desc    Update visitor record
// @route   PUT /api/visitors/:id
// @access  Private/Admin/Security
const updateVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOne({ _id: req.params.id, society: req.user.society });
  if (!visitor) {
    res.status(404);
    throw new Error('Visitor record not found');
  }
  const { society, ...updates } = req.body;
  Object.assign(visitor, updates);
  const updated = await visitor.save();
  res.json({ success: true, visitor: updated });
});

// @desc    Delete visitor record
// @route   DELETE /api/visitors/:id
// @access  Private/Admin
const deleteVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOne({ _id: req.params.id, society: req.user.society });
  if (!visitor) {
    res.status(404);
    throw new Error('Visitor record not found');
  }
  await visitor.deleteOne();
  res.json({ success: true, message: 'Visitor record deleted' });
});

module.exports = { getVisitors, getVisitor, createVisitor, checkoutVisitor, updateVisitor, deleteVisitor };
