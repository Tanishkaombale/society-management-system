const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Flat = require('../models/Flat');

// @desc    Get all users in the admin's own society, with optional filters
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { role, isApproved, status, search } = req.query;
  const filter = { society: req.user.society };
  if (role) filter.role = role;
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).populate('flat').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @desc    Get single user (must belong to the same society)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, society: req.user.society }).populate('flat');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Admin creates a user directly within their own society (e.g. security staff)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'resident',
    society: req.user.society,
    isApproved: true,
  });
  res.status(201).json({ success: true, user });
});

// @desc    Approve a pending user in the admin's society
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, society: req.user.society });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isApproved = true;
  await user.save();
  res.json({ success: true, message: 'User approved successfully', user });
});

// @desc    Update user (role, status, details) — scoped to admin's own society
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, society: req.user.society });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, phone, role, status } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (status) user.status = status;

  const updated = await user.save();
  res.json({ success: true, user: updated });
});

// @desc    Delete a user (scoped to admin's own society)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, society: req.user.society });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.flat) {
    await Flat.findByIdAndUpdate(user.flat, { $pull: { members: user._id } });
  }

  await user.deleteOne();
  res.json({ success: true, message: 'User removed successfully' });
});

// @desc    Assign a resident to a flat (both must belong to the admin's society)
// @route   PUT /api/users/:id/assign-flat
// @access  Private/Admin
const assignFlat = asyncHandler(async (req, res) => {
  const { flatId } = req.body;
  const user = await User.findOne({ _id: req.params.id, society: req.user.society });
  const flat = await Flat.findOne({ _id: flatId, society: req.user.society });

  if (!user || !flat) {
    res.status(404);
    throw new Error('User or flat not found');
  }

  user.flat = flat._id;
  await user.save();

  if (!flat.members.includes(user._id)) flat.members.push(user._id);
  if (!flat.owner) flat.owner = user._id;
  flat.status = 'occupied';
  await flat.save();

  res.json({ success: true, message: 'Flat assigned successfully', user });
});

module.exports = { getUsers, getUser, createUser, approveUser, updateUser, deleteUser, assignFlat };
