const express = require('express');
const { createPost, getPosts, getPostById, updatePostById, deletePostById, ratePost, commentOnPost } = require('../controllers/blogPostController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createPost);
router.get('/', getPosts);
router.get('/:id', authMiddleware, getPostById);
router.put('/:id', authMiddleware, updatePostById);
router.delete('/:id', authMiddleware, deletePostById);
router.post('/:id/rate', authMiddleware, ratePost);
router.post('/:id/comment', authMiddleware, commentOnPost);

module.exports = router;
