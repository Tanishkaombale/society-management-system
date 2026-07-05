const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Society = require('../models/Society');
const generateToken = require('../utils/generateToken');
const { generateUniqueSocietyCode } = require('../utils/generateSocietyCode');

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const buildUserResponse = (user, societyOverride) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  society: societyOverride || user.society,
});

// @desc    Register a new admin who is creating a brand new society
// @route   POST /api/auth/register/society
// @access  Public
const registerSociety = asyncHandler(async (req, res) => {
  const { name, email, password, phone, societyName, address, city } = req.body;

  if (!name || !email || !password || !societyName) {
    res.status(400);
    throw new Error('Please provide your name, email, password, and a name for your society');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const code = await generateUniqueSocietyCode();

  // The admin account is created first (without a society), then the society is
  // created referencing them, then we link the two together.
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'admin',
    isApproved: true,
  });

  const society = await Society.create({
    name: societyName,
    code,
    address: address || '',
    city: city || '',
    createdBy: user._id,
  });

  user.society = society._id;
  await user.save();

  res.status(201).json({
    success: true,
    message: `${society.name} was created successfully. Share join code ${society.code} with your residents.`,
    token: generateToken(user._id, user.role),
    user: buildUserResponse(user, society),
    society,
  });
});

// @desc    Register a new resident requesting to join an existing society
// @route   POST /api/auth/register/join
// @access  Public
const registerJoinRequest = asyncHandler(async (req, res) => {
  const { name, email, password, phone, societyCode } = req.body;

  if (!name || !email || !password || !societyCode) {
    res.status(400);
    throw new Error('Please provide your name, email, password, and your society join code');
  }

  const society = await Society.findOne({ code: societyCode.trim().toUpperCase() });
  if (!society) {
    res.status(404);
    throw new Error('No society found with that join code. Double check it with your admin.');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'resident',
    society: society._id,
    isApproved: false,
  });

  res.status(201).json({
    success: true,
    message: `Request sent to join ${society.name}. You'll be able to log in once the admin approves your account.`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    },
  });
});

// @desc    Look up a society by its join code (used to preview the name before submitting)
// @route   GET /api/auth/society-lookup/:code
// @access  Public
const lookupSocietyByCode = asyncHandler(async (req, res) => {
  const society = await Society.findOne({ code: req.params.code.trim().toUpperCase() }).select('name code city');
  if (!society) {
    res.status(404);
    throw new Error('No society found with that code');
  }
  res.json({ success: true, society });
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password').populate('flat').populate('society', 'name code city');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.status === 'inactive') {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact the admin.');
  }

  if (!user.isApproved) {
    res.status(403);
    throw new Error('Your account is pending admin approval.');
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      flat: user.flat,
      society: user.society,
    },
  });
});

// @desc    Continue with Google — logs in an existing account, or signs up a new
//          admin (creating a society) / resident (requesting to join one).
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  if (!googleClient) {
    res.status(501);
    throw new Error('Google Sign-In is not configured on this server yet.');
  }

  const { credential, intent, societyName, address, city, societyCode, phone } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Missing Google credential');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] })
    .populate('flat')
    .populate('society', 'name code city');

  // Existing account — just log them in (linking the Google ID if this is their
  // first time using Google Sign-In on an account created the normal way).
  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture || '';
      await user.save();
    }

    if (user.status === 'inactive') {
      res.status(403);
      throw new Error('Your account has been deactivated. Please contact the admin.');
    }
    if (!user.isApproved) {
      res.status(403);
      throw new Error('Your account is pending admin approval.');
    }

    return res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: buildUserResponse(user),
    });
  }

  // No existing account — this is a Google sign-up, following the same
  // create-a-society / join-a-society choice as normal registration.
  if (intent === 'create') {
    if (!societyName) {
      res.status(400);
      throw new Error('Please provide a name for your society');
    }
    const code = await generateUniqueSocietyCode();

    const newUser = await User.create({
      name,
      email,
      googleId,
      phone: phone || '',
      avatar: picture || '',
      role: 'admin',
      isApproved: true,
    });

    const society = await Society.create({
      name: societyName,
      code,
      address: address || '',
      city: city || '',
      createdBy: newUser._id,
    });

    newUser.society = society._id;
    await newUser.save();

    return res.status(201).json({
      success: true,
      token: generateToken(newUser._id, newUser.role),
      user: buildUserResponse(newUser, society),
      society,
      message: `${society.name} was created successfully. Share join code ${society.code} with your residents.`,
    });
  }

  if (intent === 'join') {
    if (!societyCode) {
      res.status(400);
      throw new Error('Please provide your society join code');
    }
    const society = await Society.findOne({ code: societyCode.trim().toUpperCase() });
    if (!society) {
      res.status(404);
      throw new Error('No society found with that join code');
    }

    await User.create({
      name,
      email,
      googleId,
      phone: phone || '',
      avatar: picture || '',
      role: 'resident',
      society: society._id,
      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      pendingApproval: true,
      message: `Request sent to join ${society.name}. You'll be able to log in once the admin approves your account.`,
    });
  }

  res.status(400);
  throw new Error('No account found for this Google email. Please sign up first, choosing to create or join a society.');
});

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('flat').populate('society', 'name code city address');
  res.json({ success: true, user });
});

// @desc    Update logged-in user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  if (req.body.avatar) user.avatar = req.body.avatar;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();

  res.json({
    success: true,
    user: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      avatar: updated.avatar,
    },
  });
});

module.exports = {
  registerSociety,
  registerJoinRequest,
  lookupSocietyByCode,
  loginUser,
  googleAuth,
  getMe,
  updateMe,
};
