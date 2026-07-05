const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    // Not required when the account was created via Google Sign-In.
    password: {
      type: String,
      required: [function () { return !this.googleId; }, 'Password is required'],
      minlength: 6,
      select: false,
    },
    // Populated only for accounts created/linked through "Continue with Google".
    googleId: { type: String, default: null, index: true, sparse: true },
    phone: { type: String, default: '', trim: true },
    role: {
      type: String,
      enum: ['admin', 'resident', 'security'],
      default: 'resident',
    },
    // Every account belongs to exactly one society. Admins are set as the society's
    // creator at signup; residents/security are scoped to whichever society they
    // joined or were added to.
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', default: null, index: true },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', default: null },
    avatar: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
