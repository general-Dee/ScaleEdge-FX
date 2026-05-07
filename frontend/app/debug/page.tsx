'use client';
export default function Debug() {
  return (
    <div>
      <h1>Debug Info</h1>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
      <button onClick={async () => {
        const res = await fetch('https://scaleedge-fx-api.onrender.com/api/health');
        const data = await res.json();
        alert(JSON.stringify(data));
      }}>Test Backend</button>
    </div>
  );
}
