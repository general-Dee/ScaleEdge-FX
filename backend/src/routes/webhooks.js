const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const walletService = require('../services/walletService');
const { isValidPaystackSignature } = require('../utils/paystackSignature');

router.post('/paystack', async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  if (!isValidPaystackSignature(req.rawBody, signature)) {
    return res.sendStatus(401);
  }

  const { event, data } = req.body;

  try {
    if (event === 'charge.success') {
      const accountNumber = data.authorization?.receiver_bank_account_number;
      if (accountNumber) {
        const dedicatedAccount = await prisma.dedicatedAccount.findUnique({
          where: { accountNumber }
        });
        if (dedicatedAccount) {
          await walletService.creditDeposit({
            userId: dedicatedAccount.userId,
            amountNgn: data.amount,
            paystackReference: data.reference,
            paystackId: data.id
          });
        }
      }
    } else if (event === 'transfer.success') {
      await walletService.finalizeWithdrawal({
        reference: data.reference,
        outcome: 'SUCCESS',
        paystackRef: data.transfer_code
      });
    } else if (event === 'transfer.failed' || event === 'transfer.reversed') {
      await walletService.finalizeWithdrawal({
        reference: data.reference,
        outcome: 'FAILED',
        paystackRef: data.transfer_code
      });
    }
  } catch (err) {
    console.error('Paystack webhook handling error:', err);
  }

  res.status(200).json({ received: true });
});

module.exports = router;
