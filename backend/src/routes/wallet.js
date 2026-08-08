const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const paystackService = require('../services/paystackService');
const walletService = require('../services/walletService');
const { getLiveRates } = require('../services/rateService');

const withdrawLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many withdrawal attempts, please try again later' }
});

// Get or create the user's dedicated deposit account
router.post('/account', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { dedicatedAccount: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.dedicatedAccount) {
      return res.json({
        accountNumber: user.dedicatedAccount.accountNumber,
        accountName: user.dedicatedAccount.accountName,
        bankName: user.dedicatedAccount.bankName,
        active: user.dedicatedAccount.active
      });
    }

    const { email, fullName } = req.body;
    const finalEmail = user.email || email;
    const finalFullName = user.fullName || fullName;

    if (!finalEmail || !finalFullName) {
      return res.status(400).json({
        error: 'Email and full name are required to create a deposit account. Provide them in the request body.'
      });
    }

    if (!user.email || !user.fullName) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email || finalEmail,
          fullName: user.fullName || finalFullName
        }
      });
    }

    const [firstName, ...rest] = finalFullName.trim().split(/\s+/);
    const lastName = rest.length > 0 ? rest.join(' ') : firstName;

    const customer = await paystackService.createCustomer({
      email: finalEmail,
      firstName,
      lastName,
      phone: user.phone
    });

    const dva = await paystackService.createDedicatedAccount({
      customerCode: customer.customer_code,
      preferredBank: process.env.PAYSTACK_DVA_PREFERRED_BANK || 'wema-bank'
    });

    const dedicatedAccount = await prisma.dedicatedAccount.create({
      data: {
        userId: user.id,
        paystackCustomerCode: customer.customer_code,
        accountNumber: dva.account_number,
        accountName: dva.account_name,
        bankName: dva.bank?.name || '',
        bankId: dva.bank?.id || null
      }
    });

    res.json({
      accountNumber: dedicatedAccount.accountNumber,
      accountName: dedicatedAccount.accountName,
      bankName: dedicatedAccount.bankName,
      active: dedicatedAccount.active
    });
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    res.status(502).json({ error: 'Failed to create deposit account' });
  }
});

router.get('/balance', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { walletBalance: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/banks', auth, async (req, res) => {
  try {
    const banks = await paystackService.listBanks();
    res.json(banks);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch bank list' });
  }
});

router.post('/withdraw', auth, withdrawLimiter, async (req, res) => {
  try {
    const { amountNgn, accountNumber, bankCode } = req.body;

    if (!Number.isInteger(amountNgn) || amountNgn <= 0) {
      return res.status(400).json({ error: 'amountNgn must be a positive integer (kobo)' });
    }
    if (typeof accountNumber !== 'string' || !/^\d{10}$/.test(accountNumber)) {
      return res.status(400).json({ error: 'accountNumber must be a 10-digit account number' });
    }
    if (typeof bankCode !== 'string' || !bankCode) {
      return res.status(400).json({ error: 'bankCode is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let resolved;
    try {
      resolved = await paystackService.resolveAccountNumber({ accountNumber, bankCode });
    } catch (err) {
      return res.status(400).json({ error: 'Could not resolve bank account' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaysWithdrawals = await prisma.transaction.aggregate({
      where: {
        userId: req.userId,
        type: 'WITHDRAWAL',
        status: { in: ['PENDING', 'SUCCESS'] },
        createdAt: { gte: startOfDay }
      },
      _sum: { amountNgn: true }
    });
    const rates = await getLiveRates();
    const dailyLimitNgn = user.dailyLimitUsd * rates.sell;
    const alreadyWithdrawnNgn = todaysWithdrawals._sum.amountNgn || 0;
    if (alreadyWithdrawnNgn + amountNgn > dailyLimitNgn) {
      return res.status(400).json({ error: 'This withdrawal would exceed your daily limit' });
    }

    const reference = 'wd_' + crypto.randomUUID();

    let reservation;
    try {
      reservation = await walletService.reserveWithdrawal({ userId: req.userId, amountNgn, reference });
    } catch (err) {
      if (err instanceof walletService.InsufficientFundsError) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      throw err;
    }

    try {
      const recipient = await paystackService.createTransferRecipient({
        name: resolved.account_name,
        accountNumber,
        bankCode
      });
      await paystackService.initiateTransfer({
        amountNgn,
        recipientCode: recipient.recipient_code,
        reference,
        reason: 'Scale-Edge FX withdrawal'
      });
    } catch (err) {
      await walletService.finalizeWithdrawal({ reference, outcome: 'FAILED' });
      return res.status(502).json({ error: 'Withdrawal could not be initiated' });
    }

    res.status(202).json({ transaction: reservation });
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

module.exports = router;
