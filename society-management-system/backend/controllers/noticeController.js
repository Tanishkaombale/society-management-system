const asyncHandler = require('express-async-handler');
const Notice = require('../models/Notice');

// @desc    Get all notices for the current user's society
// @route   GET /api/notices
// @access  Private
const getNotices = asyncHandler(async (req, res) => {
  const { category, important } = req.query;
  const filter = { society: req.user.society };
  if (category) filter.category = category;
  if (important !== undefined) filter.important = important === 'true';

  const notices = await Notice.find(filter)
    .populate('postedBy', 'name role')
    .sort({ important: -1, createdAt: -1 });

  res.json({ success: true, count: notices.length, notices });
});

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Private
const getNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findOne({ _id: req.params.id, society: req.user.society }).populate('postedBy', 'name role');
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  res.json({ success: true, notice });
});

// @desc    Create notice
// @route   POST /api/notices
// @access  Private/Admin
const createNotice = asyncHandler(async (req, res) => {
  const { title, description, category, important, expiresAt } = req.body;
  const notice = await Notice.create({
    title,
    description,
    category,
    important,
    expiresAt: expiresAt || null,
    postedBy: req.user._id,
    society: req.user.society,
  });
  res.status(201).json({ success: true, notice });
});

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private/Admin
const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findOne({ _id: req.params.id, society: req.user.society });
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  const { society, ...updates } = req.body;
  Object.assign(notice, updates);
  const updated = await notice.save();
  res.json({ success: true, notice: updated });
});

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findOne({ _id: req.params.id, society: req.user.society });
  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }
  await notice.deleteOne();
  res.json({ success: true, message: 'Notice deleted successfully' });
});

module.exports = { getNotices, getNotice, createNotice, updateNotice, deleteNotice };
