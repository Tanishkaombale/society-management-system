const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    month: {
      type: String,
      enum: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      required: true,
    },
    year: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    paymentDate: { type: Date, default: null },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'netbanking', 'cheque', ''], default: '' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
