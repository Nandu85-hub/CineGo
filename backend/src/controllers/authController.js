const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345!', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = asyncWrapper(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    return res.status(400).json({ success: false, error: 'User already exists with this email' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'user',
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});


const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  });
});

const getMe = asyncWrapper(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

module.exports = { register, login, getMe };
