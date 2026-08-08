'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../lib/api';

interface DedicatedAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  active: boolean;
}

interface Bank {
  name: string;
  code: string;
}

interface WalletTransaction {
  id: string;
  type: string;
  amountNgn: number;
  status: string;
  reference: string;
  createdAt: string;
}

export default function Wallet() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [account, setAccount] = useState<DedicatedAccount | null>(null);
  const [email, setEmail] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState('');
  const [withdrawBankCode, setWithdrawBankCode] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/auth/login');
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    fetchBanks();
  }, []);

  const fetchBalance = async () => {
    const res = await authFetch('/wallet/balance');
    if (res.ok) {
      const data = await res.json();
      setBalance(data.walletBalance);
    }
  };

  const fetchTransactions = async () => {
    const res = await authFetch('/wallet/transactions');
    if (res.ok) setTransactions(await res.json());
  };

  const fetchBanks = async () => {
    const res = await authFetch('/wallet/banks');
    if (res.ok) setBanks(await res.json());
  };

  const getDepositAccount = async () => {
    setCreatingAccount(true);
    try {
      const res = await authFetch('/wallet/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email ? { email } : {})
      });
      if (res.ok) {
        setAccount(await res.json());
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } finally {
      setCreatingAccount(false);
    }
  };

  const submitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawing(true);
    try {
      const res = await authFetch('/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountNgn: Math.round(parseFloat(withdrawAmount) * 100),
          accountNumber: withdrawAccountNumber,
          bankCode: withdrawBankCode
        })
      });
      if (res.ok) {
        alert('Withdrawal initiated');
        setWithdrawAmount('');
        setWithdrawAccountNumber('');
        fetchBalance();
        fetchTransactions();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } finally {
      setWithdrawing(false);
    }
  };

  const formatNaira = (kobo: number) => `₦${(kobo / 100).toLocaleString()}`;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold">Balance</h2>
        <p className="text-2xl mt-1">{balance !== null ? formatNaira(balance) : 'Loading...'}</p>
      </div>

      <div className="mt-6 p-4 border rounded">
        <h2 className="text-xl font-semibold">Deposit</h2>
        {account ? (
          <div className="mt-2 text-sm">
            <p>Transfer NGN to this account to fund your wallet:</p>
            <p className="mt-2"><span className="font-semibold">Account Number:</span> {account.accountNumber}</p>
            <p><span className="font-semibold">Account Name:</span> {account.accountName}</p>
            <p><span className="font-semibold">Bank:</span> {account.bankName}</p>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            <input
              type="email"
              placeholder="Email (required to create a deposit account)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={getDepositAccount}
              disabled={creatingAccount}
              className="bg-blue-600 text-white p-2 rounded w-full disabled:opacity-50"
            >
              {creatingAccount ? 'Creating...' : 'Get my deposit account'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 border rounded">
        <h2 className="text-xl font-semibold">Withdraw</h2>
        <form onSubmit={submitWithdraw} className="mt-2 space-y-2">
          <input
            type="number"
            step="0.01"
            placeholder="Amount (₦)"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Account Number"
            value={withdrawAccountNumber}
            onChange={e => setWithdrawAccountNumber(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={withdrawBankCode}
            onChange={e => setWithdrawBankCode(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select bank</option>
            {banks.map(bank => (
              <option key={bank.code} value={bank.code}>{bank.name}</option>
            ))}
          </select>
          <button type="submit" disabled={withdrawing} className="bg-blue-600 text-white p-2 rounded w-full disabled:opacity-50">
            {withdrawing ? 'Processing...' : 'Withdraw'}
          </button>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        {transactions.length === 0 ? <p>No transactions yet.</p> : (
          <table className="min-w-full border mt-2">
            <thead className="bg-gray-100">
              <tr><th className="p-2 border">Type</th><th className="p-2 border">Amount</th><th className="p-2 border">Status</th><th className="p-2 border">Date</th></tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td className="p-2 border text-center">{tx.type}</td>
                  <td className="p-2 border text-right">{formatNaira(tx.amountNgn)}</td>
                  <td className="p-2 border text-center">
                    <span className={`px-2 py-1 rounded text-xs ${tx.status === 'SUCCESS' ? 'bg-green-200' : tx.status === 'PENDING' ? 'bg-yellow-200' : 'bg-red-200'}`}>{tx.status}</span>
                  </td>
                  <td className="p-2 border text-center">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <a href="/dashboard" className="inline-block mt-6 text-blue-600 hover:underline">&larr; Back to dashboard</a>
    </div>
  );
}
