const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    capacity: { type: Number, required: true },
    pricePerHour: { type: Number, default: 0 },
    openTime: { type: String, default: '06:00' },
    closeTime: { type: String, default: '22:00' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Amenity', amenitySchema);
