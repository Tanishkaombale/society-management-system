const mongoose = require('mongoose');

const societySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Society name is required'], trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    address: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Society', societySchema);
