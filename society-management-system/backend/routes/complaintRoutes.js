const express = require('express');
const router = express.Router();
const {
  getComplaints, getComplaint, createComplaint, updateComplaint, addComment, deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getComplaints).post(createComplaint);
router.route('/:id').get(getComplaint).put(authorize('admin', 'security'), updateComplaint).delete(authorize('admin'), deleteComplaint);
router.post('/:id/comments', addComment);

module.exports = router;
