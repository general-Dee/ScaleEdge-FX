const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const PLACEHOLDER_JWT_SECRET = 'change_this_to_random_string';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === PLACEHOLDER_JWT_SECRET) {
  console.error('JWT_SECRET is missing or still set to the placeholder value. Set a strong random secret before starting the server.');
  process.exit(1);
}

const app = express();

// Falls back to the current production frontend URL if FRONTEND_URL isn't set
const allowedOrigin = process.env.FRONTEND_URL || 'https://scaledgefx.vercel.app';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

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

// Wallet routes
app.use('/api/wallet', require('./routes/wallet'));

// Webhook routes
app.use('/api/webhooks', require('./routes/webhooks'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));