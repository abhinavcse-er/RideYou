export function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'API route nahi mila.' });
}

export function errorHandler(error, _req, res, _next) {
  if (error.message === 'Origin not allowed') {
    return res.status(403).json({ error: 'Request origin not allowed.' });
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error('API error:', error.message);
  return res.status(status).json({
    error: status >= 500 ? 'Server mein dikkat aa gayi.' : error.message,
  });
}
