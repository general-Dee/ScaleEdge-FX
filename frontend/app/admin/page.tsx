'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../lib/api';

interface Order {
  id: string;
  type: string;
  amountUsd: number;
  rateNgn: number;
  status: string;
  createdAt: string;
  user: { phone: string; fullName: string };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      router.push('/dashboard');
      return;
    }
    setRole(userRole);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await authFetch('/orders/all');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        alert('Failed to fetch orders');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const matchOrder = async (orderId: string) => {
    try {
      const res = await authFetch(`/orders/${orderId}/match`, { method: 'PATCH' });
      if (res.ok) {
        alert('Order matched');
        // refresh orders
        fetchOrders();
      } else {
        alert('Failed to match order');
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white p-2 rounded">Logout</button>
      </div>
      <p className="text-gray-600 mt-2">Role: {role}</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">All Orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">User</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Amount (USD)</th>
                  <th className="p-2 border">Rate (₦)</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="p-2 border">{order.user?.fullName || order.user?.phone || 'N/A'}</td>
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
                    <td className="p-2 border text-center">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 border text-center">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => matchOrder(order.id)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Match
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
