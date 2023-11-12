// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Get the token from the header
        token = req.headers.authorization.split(' ')[1];
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Get user from the token
        req.user = await User.findById(decoded.id).select('-password');
        next();
      } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = authMiddleware;
