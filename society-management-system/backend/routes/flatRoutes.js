const express = require('express');
const router = express.Router();
const { getFlats, getFlat, createFlat, updateFlat, deleteFlat } = require('../controllers/flatController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getFlats).post(authorize('admin'), createFlat);
router.route('/:id').get(getFlat).put(authorize('admin'), updateFlat).delete(authorize('admin'), deleteFlat);

module.exports = router;
