const User = require('../models/user');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.register = async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      
      if (role !== 'user' && role !== 'admin') {
        return res.status(400).json({ message: 'Invalid user role' });
      }
  
      const userExists = await User.findOne({ email });
  
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const user = await User.create({ username, email, password, role });
  
      const token = generateToken(user);
  
      res.status(201).json({ 
        _id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        token 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await user.comparePassword(password)) {
      if (!user.isActive) {
          return res.status(403).json({ message: 'Account is disabled' });
      }
      const token = generateToken(user);
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, email } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.json({ 
      _id: user._id, 
      username: user.username, 
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};