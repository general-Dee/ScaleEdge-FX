const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// Create a new order (BUY or SELL)
router.post('/', auth, async (req, res) => {
  try {
    const { type, amountUsd, rateNgn } = req.body;
    if (!['BUY', 'SELL'].includes(type)) {
      return res.status(400).json({ error: 'Invalid order type' });
    }
    const order = await prisma.order.create({
      data: {
        userId: req.userId,
        type,
        amountUsd: parseInt(amountUsd),
        rateNgn: parseInt(rateNgn),
        status: 'PENDING'
      }
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get logged-in user's orders
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin only: get all orders
router.get('/all', auth, async (req, res) => {
  if (req.userRole !== 'ADMIN' && req.userRole !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { phone: true, fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin only: match order (edit status to MATCHED and record admin)
router.patch('/:id/match', auth, async (req, res) => {
  if (req.userRole !== 'ADMIN' && req.userRole !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: 'MATCHED',
        matchedBy: req.userId,
        matchedAt: new Date()
      }
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to match order' });
  }
});

module.exports = router;