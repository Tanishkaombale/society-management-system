const express = require('express');
const router = express.Router();
const {
  getUsers, getUser, createUser, approveUser, updateUser, deleteUser, assignFlat,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);
router.put('/:id/approve', approveUser);
router.put('/:id/assign-flat', assignFlat);

module.exports = router;
