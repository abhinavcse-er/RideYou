import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { formatDate, money } from '../utils/format.js';

const labels = {
  requested: 'New request', quoted: 'Fare sent', accepted: 'Accepted',
  assigned: 'Driver assigned', started: 'In progress', completed: 'Completed', cancelled: 'Cancelled',
};

export default function AdminDashboard({ token, signOut }) {
  const [admin, setAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [fares, setFares] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [identity, result] = await Promise.all([
        api('/api/admin/me', {}, token),
        api('/api/admin/bookings', {}, token),
      ]);
      setAdmin(identity.admin);
      setBookings(result.bookings || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) load(); }, [token]);
  const visible = useMemo(() => filter === 'all' ? bookings : bookings.filter((b) => b.status === filter), [bookings, filter]);
  const counts = useMemo(() => bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {}), [bookings]);

  async function update(id, patch) {
    setBusy(id);
    setError('');
    try {
      const result = await api('/api/admin/bookings/' + encodeURIComponent(id), {
        method: 'PATCH', body: JSON.stringify(patch),
      }, token);
      setBookings((items) => items.map((b) => b.id === id ? { ...b, ...result.booking } : b));
    } catch (e) { setError(e.message); }
    finally { setBusy(''); }
  }

  return <div className="admin-workspace">
    <div className="admin-welcome">
      <div><span className="eyebrow">RIDEYOU ADMIN CONSOLE</span><h3>Welcome, {admin?.displayName || 'Admin'}</h3><p>Manage ride requests, confirm fares and track every booking.</p></div>
      <div className="admin-actions"><button className="mini" onClick={load} disabled={loading}>↻ Refresh</button><button className="mini" onClick={signOut}>Sign out</button></div>
    </div>
    <div className="admin-stats">
      <article><small>Total bookings</small><strong>{bookings.length}</strong></article>
      <article><small>New requests</small><strong>{counts.requested || 0}</strong></article>
      <article><small>Fare sent</small><strong>{counts.quoted || 0}</strong></article>
      <article><small>Completed</small><strong>{counts.completed || 0}</strong></article>
    </div>
    <div className="admin-list-head"><div><h4>Booking management</h4><p>Latest 100 bookings · Private customer details</p></div><select aria-label="Filter bookings" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All bookings</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    {loading ? <div className="empty">Loading admin workspace…</div> : visible.length === 0 ? <div className="empty">No bookings in this view yet.</div> :
      <div className="admin-booking-list">{visible.map((b) => <article className="admin-booking" key={b.id}>
        <div className="admin-booking-top"><div><span className="booking-ref">{b.reference}</span><span className={'status-pill status-' + b.status}>{labels[b.status] || b.status}</span></div><small>{formatDate(b.ride_at)}</small></div>
        <div className="admin-route"><div><small>PICKUP</small><strong>{b.pickup}</strong></div><span>→</span><div><small>DESTINATION</small><strong>{b.destination}</strong></div></div>
        <div className="admin-customer"><strong>{b.customer_name}</strong><a href={'tel:' + b.customer_phone}>{b.customer_phone}</a><span>{b.passengers} passenger{b.passengers === 1 ? '' : 's'} · {b.trip_type}</span></div>
        {b.customer_note && <p className="admin-note">{b.customer_note}</p>}
        <div className="admin-booking-bottom">
          <label>Fare (₹)<input type="number" min="0" max="1000000" step="1" value={fares[b.id] ?? (b.quoted_fare ?? '')} onChange={(e) => setFares((v) => ({ ...v, [b.id]: e.target.value }))} placeholder="Enter fare"/></label>
          <button className="mini primary" disabled={busy === b.id || fares[b.id] === '' || fares[b.id] === undefined && b.quoted_fare == null} onClick={() => update(b.id, { quotedFare: Number(fares[b.id] ?? b.quoted_fare) })}>{busy === b.id ? 'Saving…' : 'Send / update fare'}</button>
          {b.status !== 'cancelled' && b.status !== 'completed' && <button className="mini danger" disabled={busy === b.id} onClick={() => update(b.id, { status: 'cancelled' })}>Cancel booking</button>}
          {b.quoted_fare != null && <strong className="fare-value">{money(b.quoted_fare)}</strong>}
        </div>
      </article>)}</div>}
  </div>;
}
