const BlogPost = require('../models/blogPost');
const User = require('../models/user'); // Make sure to import the User model

exports.searchPosts = async (req, res) => {
  const { keyword, category, author, sortBy } = req.query;

  const query = {};
  
  // Text search for keywords in title and content
  if (keyword) {
    query.$text = { $search: keyword };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Author filter (assuming you're searching by author's name or other string field)
  if (author) {
    const authors = await User.find({ username: new RegExp(author, 'i') }).select('_id');
    const authorIds = authors.map(author => author._id);
    query.author = { $in: authorIds };
  }

  try {
    let posts = BlogPost.find(query);

    // Sorting
    if (sortBy) {
      const sortParams = sortBy.split(':').join(' '); // convert sortBy to a format Mongoose understands
      posts = posts.sort(sortParams);
    } else {
      posts = posts.sort('-createdAt'); // Default sort by newest first
    }

    const results = await posts.exec();

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
