const express = require('express');
const router = express.Router();
const { getAmenities, getAmenity, createAmenity, updateAmenity, deleteAmenity } = require('../controllers/amenityController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getAmenities).post(authorize('admin'), createAmenity);
router.route('/:id').get(getAmenity).put(authorize('admin'), updateAmenity).delete(authorize('admin'), deleteAmenity);

module.exports = router;
