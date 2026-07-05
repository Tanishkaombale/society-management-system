const asyncHandler = require('express-async-handler');
const Amenity = require('../models/Amenity');

const getAmenities = asyncHandler(async (req, res) => {
  const amenities = await Amenity.find({ society: req.user.society }).sort({ name: 1 });
  res.json({ success: true, count: amenities.length, amenities });
});

const getAmenity = asyncHandler(async (req, res) => {
  const amenity = await Amenity.findOne({ _id: req.params.id, society: req.user.society });
  if (!amenity) {
    res.status(404);
    throw new Error('Amenity not found');
  }
  res.json({ success: true, amenity });
});

const createAmenity = asyncHandler(async (req, res) => {
  const amenity = await Amenity.create({ ...req.body, society: req.user.society });
  res.status(201).json({ success: true, amenity });
});

const updateAmenity = asyncHandler(async (req, res) => {
  const amenity = await Amenity.findOne({ _id: req.params.id, society: req.user.society });
  if (!amenity) {
    res.status(404);
    throw new Error('Amenity not found');
  }
  const { society, ...updates } = req.body;
  Object.assign(amenity, updates);
  const updated = await amenity.save();
  res.json({ success: true, amenity: updated });
});

const deleteAmenity = asyncHandler(async (req, res) => {
  const amenity = await Amenity.findOne({ _id: req.params.id, society: req.user.society });
  if (!amenity) {
    res.status(404);
    throw new Error('Amenity not found');
  }
  await amenity.deleteOne();
  res.json({ success: true, message: 'Amenity removed successfully' });
});

module.exports = { getAmenities, getAmenity, createAmenity, updateAmenity, deleteAmenity };
