require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const blogPostRoutes = require('./routes/blogPostRoutes');
const userInteractionRoutes = require('./routes/userInteractionRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');


const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', blogPostRoutes);
app.use('/api/users', userInteractionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log('Server is running on port ${process.env.PORT}');
    });
  })
  .catch((err) => console.log(err));