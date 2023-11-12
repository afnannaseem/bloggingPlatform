const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number }],
  comments: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, comment: String, createdAt: { type: Date, default: Date.now } }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

blogPostSchema.index({ title: 'text', content: 'text', category: 'text' });
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
