// adminController.js
const User = require('../models/user');
const BlogPost = require('../models/blogPost');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords from the result
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disable a user
exports.disableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = false;
    await user.save();
    res.status(200).json({ message: 'User disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List all blog posts with average ratings
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find().populate('author', 'username').lean();

    // Calculate the average rating for each post
    posts.forEach(post => {
      if (post.ratings.length > 0) {
        const totalRating = post.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        post.averageRating = totalRating / post.ratings.length;
      } else {
        post.averageRating = 0;
      }
    });

    res.json(posts.map(({ title, author, createdAt, averageRating }) => ({
      title,
      author: author.username,
      createdAt,
      averageRating
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disable a blog post
exports.disablePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.isActive = false;
    await post.save();
    res.status(200).json({ message: 'Post disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
