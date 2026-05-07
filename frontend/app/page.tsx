'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('Backend unreachable'));
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600">Scale-Edge FX</h1>
        <p className="text-gray-600 mt-2">USD Exchange Platform for Kaduna</p>
        <div className="mt-6 p-4 bg-white rounded shadow">
          <p>Backend Status: <span className="font-mono">{status}</span></p>
          <div className="mt-4">
            <a href="/auth/login" className="text-blue-500 hover:underline">Login</a> | 
            <a href="/auth/register" className="text-blue-500 hover:underline ml-2">Register</a>
          </div>
        </div>
      </div>
    </main>
  );
}
