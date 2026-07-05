const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');

// @desc    Get payments (residents see own, admin sees all in their society)
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
  const { status, month, year } = req.query;
  const filter = { society: req.user.society };

  if (req.user.role === 'resident') {
    filter.resident = req.user._id;
  }
  if (status) filter.status = status;
  if (month) filter.month = month;
  if (year) filter.year = Number(year);

  const payments = await Payment.find(filter)
    .populate('resident', 'name email phone')
    .populate('flat', 'flatNumber block')
    .sort({ year: -1, createdAt: -1 });

  res.json({ success: true, count: payments.length, payments });
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, society: req.user.society })
    .populate('resident', 'name email phone')
    .populate('flat', 'flatNumber block');

  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  if (req.user.role === 'resident' && payment.resident._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this payment');
  }

  res.json({ success: true, payment });
});

// @desc    Generate a maintenance bill (admin)
// @route   POST /api/payments
// @access  Private/Admin
const createPayment = asyncHandler(async (req, res) => {
  const { resident, flat, amount, month, year, dueDate, remarks } = req.body;

  const payment = await Payment.create({
    resident,
    flat,
    amount,
    month,
    year,
    dueDate,
    remarks,
    invoiceNumber: generateInvoiceNumber(),
    society: req.user.society,
  });

  res.status(201).json({ success: true, payment });
});

// @desc    Mark payment as paid
// @route   PUT /api/payments/:id/pay
// @access  Private
const markAsPaid = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, society: req.user.society });
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  if (req.user.role === 'resident' && payment.resident.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this payment');
  }

  payment.status = 'paid';
  payment.paymentDate = new Date();
  payment.paymentMethod = req.body.paymentMethod || 'upi';
  await payment.save();

  res.json({ success: true, payment });
});

// @desc    Update payment record
// @route   PUT /api/payments/:id
// @access  Private/Admin
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, society: req.user.society });
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }
  const { society, ...updates } = req.body;
  Object.assign(payment, updates);
  const updated = await payment.save();
  res.json({ success: true, payment: updated });
});

// @desc    Delete payment record
// @route   DELETE /api/payments/:id
// @access  Private/Admin
const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, society: req.user.society });
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }
  await payment.deleteOne();
  res.json({ success: true, message: 'Payment record deleted' });
});

module.exports = { getPayments, getPayment, createPayment, markAsPaid, updatePayment, deletePayment };
