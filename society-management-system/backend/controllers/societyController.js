const asyncHandler = require('express-async-handler');
const Society = require('../models/Society');

// @desc    Get the current user's society
// @route   GET /api/societies/me
// @access  Private
const getMySociety = asyncHandler(async (req, res) => {
  const society = await Society.findById(req.user.society).populate('createdBy', 'name email');
  if (!society) {
    res.status(404);
    throw new Error('Society not found');
  }
  res.json({ success: true, society });
});

// @desc    Update the current society's details
// @route   PUT /api/societies/me
// @access  Private/Admin
const updateMySociety = asyncHandler(async (req, res) => {
  const society = await Society.findById(req.user.society);
  if (!society) {
    res.status(404);
    throw new Error('Society not found');
  }

  const { name, address, city } = req.body;
  if (name) society.name = name;
  if (address !== undefined) society.address = address;
  if (city !== undefined) society.city = city;

  const updated = await society.save();
  res.json({ success: true, society: updated });
});

module.exports = { getMySociety, updateMySociety };
