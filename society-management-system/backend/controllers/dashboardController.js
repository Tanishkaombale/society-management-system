const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Flat = require('../models/Flat');
const Complaint = require('../models/Complaint');
const Visitor = require('../models/Visitor');
const Payment = require('../models/Payment');
const Notice = require('../models/Notice');

// @desc    Get dashboard stats scoped to role and society
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const societyId = req.user.society;

  if (req.user.role === 'admin') {
    const [totalResidents, totalFlats, occupiedFlats, pendingComplaints, activeVisitors, pendingPayments, totalCollected, recentNotices] =
      await Promise.all([
        User.countDocuments({ society: societyId, role: 'resident', isApproved: true }),
        Flat.countDocuments({ society: societyId }),
        Flat.countDocuments({ society: societyId, status: 'occupied' }),
        Complaint.countDocuments({ society: societyId, status: { $in: ['pending', 'in-progress'] } }),
        Visitor.countDocuments({ society: societyId, status: 'checked-in' }),
        Payment.countDocuments({ society: societyId, status: { $ne: 'paid' } }),
        Payment.aggregate([
          { $match: { society: societyId, status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Notice.find({ society: societyId }).sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name'),
      ]);

    const complaintsByStatus = await Complaint.aggregate([
      { $match: { society: societyId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const paymentsByStatus = await Payment.aggregate([
      { $match: { society: societyId } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]);
    const pendingApprovals = await User.countDocuments({ society: societyId, isApproved: false });

    return res.json({
      success: true,
      stats: {
        totalResidents,
        totalFlats,
        occupiedFlats,
        vacantFlats: totalFlats - occupiedFlats,
        pendingComplaints,
        activeVisitors,
        pendingPayments,
        totalCollected: totalCollected[0]?.total || 0,
        pendingApprovals,
        complaintsByStatus,
        paymentsByStatus,
        recentNotices,
      },
    });
  }

  if (req.user.role === 'security') {
    const [activeVisitors, todayVisitors, recentNotices] = await Promise.all([
      Visitor.countDocuments({ society: societyId, status: 'checked-in' }),
      Visitor.countDocuments({ society: societyId, entryTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      Notice.find({ society: societyId }).sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name'),
    ]);
    return res.json({ success: true, stats: { activeVisitors, todayVisitors, recentNotices } });
  }

  // resident
  const [myComplaints, myPendingPayments, myTotalDue, recentNotices] = await Promise.all([
    Complaint.countDocuments({ society: societyId, raisedBy: req.user._id, status: { $in: ['pending', 'in-progress'] } }),
    Payment.countDocuments({ society: societyId, resident: req.user._id, status: { $ne: 'paid' } }),
    Payment.aggregate([
      { $match: { society: societyId, resident: req.user._id, status: { $ne: 'paid' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Notice.find({ society: societyId }).sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name'),
  ]);

  res.json({
    success: true,
    stats: {
      myComplaints,
      myPendingPayments,
      myTotalDue: myTotalDue[0]?.total || 0,
      recentNotices,
    },
  });
});

module.exports = { getStats };
