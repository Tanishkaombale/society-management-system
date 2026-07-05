const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    purpose: { type: String, required: true },
    flatToVisit: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true },
    hostResident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    vehicleNumber: { type: String, default: '' },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date, default: null },
    status: { type: String, enum: ['checked-in', 'checked-out', 'pending-approval'], default: 'checked-in' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photo: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', visitorSchema);
