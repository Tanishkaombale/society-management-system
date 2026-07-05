const express = require('express');
const router = express.Router();
const {
  registerSociety, registerJoinRequest, lookupSocietyByCode, loginUser, googleAuth, getMe, updateMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register/society', registerSociety);
router.post('/register/join', registerJoinRequest);
router.get('/society-lookup/:code', lookupSocietyByCode);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
