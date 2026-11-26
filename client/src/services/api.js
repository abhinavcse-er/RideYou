const API = import.meta.env.VITE_API_URL || '';

export async function api(path, options = {}, token) {
  const response = await fetch(API + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request complete nahi ho payi.');
  return payload;
}

export const apiBaseUrl = API;
