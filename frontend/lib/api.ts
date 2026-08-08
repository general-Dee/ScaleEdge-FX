export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://scaleedge-fx-api.onrender.com/api';

export async function authFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/auth/login';
  }

  return res;
}
