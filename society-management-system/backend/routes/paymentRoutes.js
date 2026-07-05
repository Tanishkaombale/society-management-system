const express = require('express');
const router = express.Router();
const {
  getPayments, getPayment, createPayment, markAsPaid, updatePayment, deletePayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getPayments).post(authorize('admin'), createPayment);
router.route('/:id').get(getPayment).put(authorize('admin'), updatePayment).delete(authorize('admin'), deletePayment);
router.put('/:id/pay', markAsPaid);

module.exports = router;
