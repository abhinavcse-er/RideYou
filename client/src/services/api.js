// GitHub Pages and Render are hosted on different origins. Keep a production
// fallback so the public site still reaches the API when the Actions variable
// VITE_API_URL has not been configured.
const API = (import.meta.env.VITE_API_URL || 'https://rideyou.onrender.com').replace(/\/$/, '');

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
