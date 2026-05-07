'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  type: string;
  amountUsd: number;
  rateNgn: number;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [rates, setRates] = useState({ buy: 1450, sell: 1470 });
  const [loadingRates, setLoadingRates] = useState(true);
  const [orderType, setOrderType] = useState('BUY');
  const [amountUsd, setAmountUsd] = useState('');
  const [rateNgn, setRateNgn] = useState('');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/auth/login');
  }, []);

  // Fetch rates
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch(`"https://scaleedge-fx-api.onrender.com/api"/rates/live`);
      if (res.ok) {
        const data = await res.json();
        setRates(data);
        if (orderType === 'BUY') setRateNgn(data.buy.toString());
        else setRateNgn(data.sell.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRates(false);
    }
  };

  // Fetch my orders
  const fetchMyOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`"https://scaleedge-fx-api.onrender.com/api"/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  // Place order
  const placeOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch(`"https://scaleedge-fx-api.onrender.com/api"/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: orderType,
          amountUsd: parseInt(amountUsd),
          rateNgn: parseInt(rateNgn)
        })
      });
      if (res.ok) {
        alert('Order placed successfully');
        setAmountUsd('');
        fetchMyOrders();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  const handleTypeChange = (type: string) => {
    setOrderType(type);
    if (type === 'BUY') setRateNgn(rates.buy.toString());
    else setRateNgn(rates.sell.toString());
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Live Rates */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold">Live Rates (USD/NGN)</h2>
        {loadingRates ? <p>Loading...</p> : (
          <>
            <p>Buy: ?{rates.buy}</p>
            <p>Sell: ?{rates.sell}</p>
            <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
          </>
        )}
      </div>

      {/* Order Form */}
      <div className="mt-6 p-4 border rounded">
        <h2 className="text-xl font-semibold">Place Order</h2>
        <div className="mt-2 space-y-2">
          <select
            value={orderType}
            onChange={e => handleTypeChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="BUY">I want to BUY USD</option>
            <option value="SELL">I want to SELL USD</option>
          </select>
          <input
            type="number"
            placeholder="Amount (USD)"
            value={amountUsd}
            onChange={e => setAmountUsd(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Rate (? per USD)"
            value={rateNgn}
            onChange={e => setRateNgn(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={placeOrder}
            className="bg-blue-600 text-white p-2 rounded w-full"
          >
            Place Order
          </button>
        </div>
      </div>

      {/* My Orders */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">My Orders</h2>
        {loadingOrders ? (
          <p>Loading...</p>
        ) : myOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Amount (USD)</th>
                  <th className="p-2 border">Rate (?)</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map(order => (
                  <tr key={order.id}>
                    <td className="p-2 border text-center">{order.type}</td>
                    <td className="p-2 border text-right">{order.amountUsd}</td>
                    <td className="p-2 border text-right">{order.rateNgn}</td>
                    <td className="p-2 border text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'PENDING' ? 'bg-yellow-200' :
                        order.status === 'MATCHED' ? 'bg-green-200' :
                        'bg-gray-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-2 border text-center">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button onClick={handleLogout} className="mt-6 bg-red-600 text-white p-2 rounded">Logout</button>
    </div>
  );
}

