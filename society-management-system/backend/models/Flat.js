const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    flatNumber: { type: String, required: true, trim: true },
    block: { type: String, required: true, trim: true },
    floor: { type: Number, required: true },
    type: { type: String, enum: ['1BHK', '2BHK', '3BHK', '4BHK', 'Duplex', 'Other'], default: '2BHK' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['occupied', 'vacant'], default: 'vacant' },
    parkingSlots: { type: Number, default: 0 },
    monthlyMaintenance: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

// Flat numbers only need to be unique within a single society, not globally —
// two different societies can each have a "A-101".
flatSchema.index({ society: 1, flatNumber: 1, block: 1 }, { unique: true });

module.exports = mongoose.model('Flat', flatSchema);
