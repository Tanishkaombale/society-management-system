const express = require('express');
const router = express.Router();
const {
  getVisitors, getVisitor, createVisitor, checkoutVisitor, updateVisitor, deleteVisitor,
} = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getVisitors).post(authorize('admin', 'security'), createVisitor);
router.route('/:id').get(getVisitor).put(authorize('admin', 'security'), updateVisitor).delete(authorize('admin'), deleteVisitor);
router.put('/:id/checkout', authorize('admin', 'security'), checkoutVisitor);

module.exports = router;
