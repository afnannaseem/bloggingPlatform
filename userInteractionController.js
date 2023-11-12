const User = require('../models/user');
const BlogPost = require('../models/blogPost');

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    // Check if already following
    if (currentUser.follows.includes(req.params.userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add target user to the current user's follows
    currentUser.follows.push(req.params.userId);
    await currentUser.save();

    // Add a new follower notification for the target user
    targetUser.notifications.push({
      type: 'newFollower',
      byUser: req.user._id
    });

    await targetUser.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get the feed for a user
exports.getUserFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).populate('follows');

    // Get the IDs of the users that the current user follows
    const followsIds = currentUser.follows.map((user) => user._id);

    // Find all posts from these users
    const posts = await BlogPost.find({ author: { $in: followsIds } }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    res.status(200).json(currentUser.notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notifications as read
exports.markNotificationsRead = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    currentUser.notifications.forEach((notification) => {
      notification.read = true;
    });

    await currentUser.save();

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
