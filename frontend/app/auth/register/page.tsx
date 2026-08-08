'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../lib/api';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('You must agree to the Terms of Service and Privacy Policy to register');
      return;
    }
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, fullName })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      router.push('/dashboard');
    } else {
      const err = await res.json();
      alert('Registration failed: ' + (err.error || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-2 border rounded mb-2" />
        <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded mb-2" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded mb-4" />
        <label className="flex items-start gap-2 text-sm mb-4">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1" />
          <span>
            I agree to the <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>
          </span>
        </label>
        <button type="submit" disabled={!agreed} className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">Register</button>
      </form>
    </div>
  );
}