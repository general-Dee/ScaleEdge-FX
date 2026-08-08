const prisma = require('../lib/prisma');

class InsufficientFundsError extends Error {}

async function creditDeposit({ userId, amountNgn, paystackReference, paystackId }) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId,
          type: 'DEPOSIT',
          amountNgn,
          reference: paystackReference,
          status: 'SUCCESS',
          paystackRef: String(paystackId)
        }
      });
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amountNgn } }
      });
    });
    return { credited: true };
  } catch (err) {
    if (err.code === 'P2002') return { credited: false, reason: 'duplicate' };
    throw err;
  }
}

async function reserveWithdrawal({ userId, amountNgn, reference }) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: { id: userId, walletBalance: { gte: amountNgn } },
      data: { walletBalance: { decrement: amountNgn } }
    });
    if (updated.count === 0) throw new InsufficientFundsError();
    return tx.transaction.create({
      data: { userId, type: 'WITHDRAWAL', amountNgn, reference, status: 'PENDING' }
    });
  });
}

async function finalizeWithdrawal({ reference, outcome, paystackRef }) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.updateMany({
      where: { reference, status: 'PENDING' },
      data: { status: outcome, paystackRef }
    });
    if (updated.count === 0) return { applied: false };
    if (outcome === 'FAILED') {
      const txRow = await tx.transaction.findUniqueOrThrow({ where: { reference } });
      await tx.user.update({
        where: { id: txRow.userId },
        data: { walletBalance: { increment: txRow.amountNgn } }
      });
    }
    return { applied: true };
  });
}

module.exports = {
  InsufficientFundsError,
  creditDeposit,
  reserveWithdrawal,
  finalizeWithdrawal
};
