const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Hardcode the allowed origin – replace with your actual frontend URL if different
const allowedOrigin = 'https://scaledgefx.vercel.app';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Rates routes
app.use('/api/rates', require('./routes/rates'));

// Orders routes
app.use('/api/orders', require('./routes/orders'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));