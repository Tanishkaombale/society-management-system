const express = require('express');
const router = express.Router();
const { getMySociety, updateMySociety } = require('../controllers/societyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/me', getMySociety);
router.put('/me', authorize('admin'), updateMySociety);

module.exports = router;
