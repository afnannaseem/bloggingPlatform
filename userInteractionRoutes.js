const express = require('express');
const { followUser, getUserFeed, getNotifications, markNotificationsRead } = require('../controllers/userInteractionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/follow/:userId', authMiddleware, followUser);
router.get('/feed', authMiddleware, getUserFeed);
router.get('/notifications', authMiddleware, getNotifications);
router.put('/notifications', authMiddleware, markNotificationsRead);

module.exports = router;
