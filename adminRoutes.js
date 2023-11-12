// adminRoutes.js
const express = require('express');
const { getAllUsers, disableUser, getAllPosts, disablePost } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware to check if the user is an admin
const adminCheck = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
};

router.get('/users', authMiddleware, adminCheck, getAllUsers);
router.put('/user/disable/:userId', authMiddleware, adminCheck, disableUser);
router.get('/posts', authMiddleware, adminCheck, getAllPosts);
router.put('/post/disable/:postId', authMiddleware, adminCheck, disablePost);

module.exports = router;
