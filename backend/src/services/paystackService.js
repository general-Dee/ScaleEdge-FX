const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
});

async function createCustomer({ email, firstName, lastName, phone }) {
  try {
    const res = await client.post('/customer', {
      email,
      first_name: firstName,
      last_name: lastName,
      phone
    });
    return res.data.data;
  } catch (error) {
    console.error('Paystack createCustomer error:', error.response?.data || error.message);
    throw error;
  }
}

async function createDedicatedAccount({ customerCode, preferredBank }) {
  try {
    const res = await client.post('/dedicated_account', {
      customer: customerCode,
      preferred_bank: preferredBank
    });
    return res.data.data;
  } catch (error) {
    console.error('Paystack createDedicatedAccount error:', error.response?.data || error.message);
    throw error;
  }
}

async function resolveAccountNumber({ accountNumber, bankCode }) {
  try {
    const res = await client.get('/bank/resolve', {
      params: { account_number: accountNumber, bank_code: bankCode }
    });
    return res.data.data;
  } catch (error) {
    console.error('Paystack resolveAccountNumber error:', error.response?.data || error.message);
    throw error;
  }
}

async function createTransferRecipient({ name, accountNumber, bankCode }) {
  try {
    const res = await client.post('/transferrecipient', {
      type: 'nuban',
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN'
    });
    return res.data.data;
  } catch (error) {
    console.error('Paystack createTransferRecipient error:', error.response?.data || error.message);
    throw error;
  }
}

async function initiateTransfer({ amountNgn, recipientCode, reference, reason }) {
  try {
    const res = await client.post('/transfer', {
      source: 'balance',
      amount: amountNgn,
      recipient: recipientCode,
      reference,
      reason
    });
    return res.data.data;
  } catch (error) {
    console.error('Paystack initiateTransfer error:', error.response?.data || error.message);
    throw error;
  }
}

async function listBanks() {
  try {
    const res = await client.get('/bank', { params: { country: 'nigeria' } });
    return res.data.data;
  } catch (error) {
    console.error('Paystack listBanks error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  createCustomer,
  createDedicatedAccount,
  resolveAccountNumber,
  createTransferRecipient,
  initiateTransfer,
  listBanks
};
