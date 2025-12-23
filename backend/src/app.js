require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Routes
const tractorRoutes = require('./routes/tractorRoutes');
const tripRoutes = require('./routes/tripRoutes');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const userRoutes = require('./routes/userRoutes');
const { authenticate } = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/tractors',authenticate, tractorRoutes);
app.use('/api/trips', authenticate, tripRoutes);
app.use('/api/expenses', authenticate, expenseRoutes);
app.use('/api/user',authenticate,userRoutes);

app.get('/', (req, res) => {
  res.send('Sugarcane Manager API is Running 🚀');
});

module.exports = app;