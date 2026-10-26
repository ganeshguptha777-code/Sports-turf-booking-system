const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function api(path, options = {}) {
  const { method = 'GET', body, headers = {}, signal } = options;
  const token = localStorage.getItem('turfbook_token');

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    signal,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_error) {
    data = { message: text };
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
