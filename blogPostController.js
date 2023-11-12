const BlogPost = require('../models/blogPost');
const User = require('../models/user');

// Create a blog post
exports.createPost = async (req, res) => {
  const { title, content, category } = req.body;
  try {
    const post = new BlogPost({ title, content, category, author: req.user._id });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all blog posts with pagination
exports.getPosts = async (req, res) => {
    const pageSize = 10; // Number of posts per page
    const page = parseInt(req.query.page) || 1; // Page number
    
    // Construct the base query for either admins or post owners
    let query = { isActive: true };
    if (req.user && req.user.role === 'admin') {
      query = {}; // Admins see all posts
    } else if (req.user) {
      query = { $or: [{ isActive: true }, { author: req.user._id }] }; // Users see all active posts and their own posts
    }
  
    try {
      const count = await BlogPost.countDocuments(query);
      const posts = await BlogPost.find(query)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 }); // Latest posts first
      
      res.json({ 
        posts, 
        page, 
        pages: Math.ceil(count / pageSize) 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// Get a single blog post by ID

exports.getPostById = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id).populate('author', 'username');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Allow the admin to view any post, or the owner to view their post, even if it's disabled
        if (req.user.role === 'admin' || post.author._id.equals(req.user._id)) {
            return res.json(post);
        }

        // If the post is disabled, do not allow other users to view it
        if (!post.isActive) {
            return res.status(403).json({ message: 'Not authorized to view this post' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

  

// Update a blog post by ID
exports.updatePostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    const { title, content, category } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a blog post by ID
exports.deletePostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rate a blog post
exports.ratePost = async (req, res) => {
    try {
      const post = await BlogPost.findById(req.params.id);
      const user = await User.findById(req.user._id);
  
      // Check if the post exists
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Check if the user is following the author of the post
      const isFollowing = user.follows.some(followedUserId => followedUserId.toString() === post.author.toString());
      if (!isFollowing) {
        return res.status(403).json({ message: 'You can only rate posts from users you follow' });
      }
  
      // Check if the post has already been rated by this user
      const alreadyRated = post.ratings.some(rating => rating.user.toString() === req.user._id.toString());
      if (alreadyRated) {
        return res.status(400).json({ message: 'You have already rated this post' });
      }
  
      // Add the rating
      post.ratings.push({ user: req.user._id, rating: req.body.rating });
      await post.save();
  
      res.json({ message: 'Your rating has been added' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// Comment on a blog post
exports.commentOnPost = async (req, res) => {
    try {
      const post = await BlogPost.findById(req.params.id);
      const user = await User.findById(req.user._id);
  
      // Check if the post exists
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Check if the user follows the author of the post
      const isFollowing = user.follows.some(followedUserId => followedUserId.toString() === post.author.toString());
      if (!isFollowing) {
        return res.status(403).json({ message: 'You can only comment on posts from users you follow' });
      }
  
      // Add the comment
      const comment = {
        user: req.user._id,
        comment: req.body.comment,
      };
      post.comments.push(comment);
      await post.save();
  
      // Notify the post author of the new comment
      const postAuthor = await User.findById(post.author);
      postAuthor.notifications.push({
        type: 'newComment',
        byUser: user._id,
        post: post._id,
        date: new Date(),
        read: false
      });
      await postAuthor.save();
  
      res.status(201).json({ message: 'Comment added' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
