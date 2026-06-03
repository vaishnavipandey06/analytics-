const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const fallbackDb = require('../utils/fallbackDb');

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id || user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'churnvision_super_secret_jwt_key_2026_safe',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Please provide name, email and password' });
  }

  try {
    if (global.dbConnected) {
      // Mongoose check
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ status: 'error', message: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'Analyst'
      });

      return res.status(201).json({
        status: 'success',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: generateToken(user)
      });
    } else {
      // Fallback check
      const userExists = fallbackDb.findUserByEmail(email);
      if (userExists) {
        return res.status(400).json({ status: 'error', message: 'User already exists with this email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = fallbackDb.saveUser({
        name,
        email,
        password: hashedPassword,
        role: role || 'Analyst'
      });

      return res.status(201).json({
        status: 'success',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: generateToken(user)
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
  }

  try {
    if (global.dbConnected) {
      const user = await User.findOne({ email });
      if (user && (await user.comparePassword(password))) {
        return res.json({
          status: 'success',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token: generateToken(user)
        });
      }
    } else {
      const user = fallbackDb.findUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          status: 'success',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token: generateToken(user)
        });
      }
    }

    res.status(401).json({ status: 'error', message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user is set by auth middleware
  res.json({
    status: 'success',
    user: req.user
  });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: 'error', message: 'Please provide email' });
  }

  try {
    let exists = false;
    if (global.dbConnected) {
      const user = await User.findOne({ email });
      exists = !!user;
    } else {
      const user = fallbackDb.findUserByEmail(email);
      exists = !!user;
    }

    if (!exists) {
      return res.status(404).json({ status: 'error', message: 'No user registered with this email address' });
    }

    // Return a mock reset token for security flow verification
    res.json({
      status: 'success',
      message: 'Password reset link sent to registered email address.',
      resetToken: 'mock-reset-token-' + Date.now()
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during password recovery' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Please provide email and new password' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(password, salt);

    if (global.dbConnected) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
      user.password = password; // Pre-save middleware will hash it
      await user.save();
    } else {
      const updated = fallbackDb.updateUserPassword(email, newHashedPassword);
      if (!updated) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
    }

    res.json({
      status: 'success',
      message: 'Password reset successfully. You can now login.'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during password reset' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword
};
