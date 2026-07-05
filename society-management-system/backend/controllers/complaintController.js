const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');

// @desc    Get complaints (residents see own, admin/security see all in their society)
// @route   GET /api/complaints
// @access  Private
const getComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority } = req.query;
  const filter = { society: req.user.society };

  if (req.user.role === 'resident') {
    filter.raisedBy = req.user._id;
  }
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  const complaints = await Complaint.find(filter)
    .populate('raisedBy', 'name email phone flat')
    .populate('assignedTo', 'name email')
    .populate('comments.postedBy', 'name role')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: complaints.length, complaints });
});

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, society: req.user.society })
    .populate('raisedBy', 'name email phone flat')
    .populate('assignedTo', 'name email')
    .populate('comments.postedBy', 'name role');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (req.user.role === 'resident' && complaint.raisedBy._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this complaint');
  }

  res.json({ success: true, complaint });
});

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;
  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority,
    raisedBy: req.user._id,
    society: req.user.society,
  });
  res.status(201).json({ success: true, complaint });
});

// @desc    Update complaint status/assignment (admin/security)
// @route   PUT /api/complaints/:id
// @access  Private/Admin/Security
const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, society: req.user.society });
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const { status, priority, assignedTo } = req.body;
  if (status) {
    complaint.status = status;
    if (status === 'resolved') complaint.resolvedAt = new Date();
  }
  if (priority) complaint.priority = priority;
  if (assignedTo) complaint.assignedTo = assignedTo;

  const updated = await complaint.save();
  res.json({ success: true, complaint: updated });
});

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, society: req.user.society });
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  if (req.user.role === 'resident' && complaint.raisedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to comment on this complaint');
  }

  complaint.comments.push({ text: req.body.text, postedBy: req.user._id });
  await complaint.save();

  const updated = await Complaint.findById(req.params.id).populate('comments.postedBy', 'name role');
  res.status(201).json({ success: true, comments: updated.comments });
});

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, society: req.user.society });
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  await complaint.deleteOne();
  res.json({ success: true, message: 'Complaint deleted successfully' });
});

module.exports = { getComplaints, getComplaint, createComplaint, updateComplaint, addComment, deleteComplaint };
