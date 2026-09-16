import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageSquareWarning, PackageSearch, Search, Star, Truck } from 'lucide-react';
import trackingApi from '../../api/trackingApi';
import { STATUS_FLOW, statusLabel, statusTone, flowIndex, isTerminal } from '../../utils/shipmentStatus';
import StatusBadge from '../../components/common/StatusBadge';
import { PORTAL_ROLE } from '../../config/portal';

const styles = `
  .track-shell { min-height: 100vh; background: linear-gradient(135deg, #0f1a2f 0%, #12213F 45%, #1b2e5c 100%); padding: 40px 20px; }
  .track-inner { max-width: 720px; margin: 0 auto; }
  .track-brand { display: flex; align-items: center; gap: 10px; color: #fff; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 17px; margin-bottom: 26px; }
  .track-brand-mark { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, #F5A524, #D9860F); display: flex; align-items: center; justify-content: center; color: #211200; font-weight: 800; font-size: 13px; }
  .track-card { background: #fff; border-radius: 20px; padding: 28px; box-shadow: 0 20px 40px rgba(18,33,63,.25); }
  .track-title { font-family: 'Sora', sans-serif; font-size: 22px; color: #12213F; margin: 0 0 6px; }
  .track-sub { color: #697086; font-size: 13px; margin: 0 0 20px; }
  .track-search { display: flex; gap: 10px; }
  .track-search input { flex: 1; border: 1.5px solid #E3E7EF; border-radius: 10px; padding: 12px 14px; font-size: 13.5px; }
  .track-search button { border: none; background: #F5A524; color: #211200; border-radius: 10px; padding: 0 18px; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
  .track-result { margin-top: 24px; padding-top: 20px; border-top: 1px solid #E3E7EF; }
  .track-empty { margin-top: 20px; color: #B23528; background: #FDE9E7; padding: 12px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 600; }
  .track-back { display: inline-flex; align-items: center; gap: 7px; margin-top: 18px; color: rgba(255,255,255,0.8); font-size: 12.5px; font-weight: 600; }
  .track-action-row { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
  .track-action-btn { flex: 1; min-width: 160px; border: 1.5px solid #E3E7EF; background: #fff; color: #12213F; border-radius: 10px; padding: 10px 14px; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 12.5px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
  .track-action-btn:hover { border-color: #F5A524; }
  .track-form { margin-top: 18px; padding: 18px; background: #F9FAFC; border-radius: 12px; border: 1px solid #E3E7EF; }
  .track-form label { display: block; font-size: 11.5px; font-weight: 700; color: #697086; margin: 12px 0 5px; }
  .track-form label:first-child { margin-top: 0; }
  .track-form input, .track-form select, .track-form textarea { width: 100%; border: 1.5px solid #E3E7EF; border-radius: 9px; padding: 10px 12px; font-size: 13px; font-family: inherit; }
  .track-form textarea { resize: vertical; }
  .track-form-submit { margin-top: 16px; border: none; background: #12213F; color: #fff; border-radius: 10px; padding: 11px 18px; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; }
  .track-form-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .star-picker { display: flex; gap: 4px; }
  .star-picker button { background: transparent; border: none; cursor: pointer; padding: 2px; }
`;

function StarPicker({ value, onChange, label }) {
  return (
    <div>
      <label>{label}</label>
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star`}>
            <Star size={22} fill={n <= value ? '#F5A524' : 'none'} color={n <= value ? '#F5A524' : '#CBD3E2'} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PublicTrackingPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('tn') || '');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [panel, setPanel] = useState(null); // 'complaint' | 'review' | null
  const [submitting, setSubmitting] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ name: '', email: '', category: 'Late delivery', description: '' });
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', riderRating: 5, deliveryRating: 5, comment: '' });

  // This page is reachable without signing in, so it must never touch the
  // authenticated /api/app-data store - it only calls the dedicated public
  // lookup (GET /api/tracking/:trackingNumber), which returns nothing but
  // tracking-status fields for the one shipment matched (see
  // backend/controllers/trackingController.js). The customer portal build
  // (vite --mode customer, PORTAL_ROLE === 'customer') renders ONLY this
  // page at every path - see routes/AppRoutes.jsx - so a recipient never
  // needs an account, a login screen, or a dashboard to track a shipment.
  const runSearch = async (term) => {
    setPanel(null);
    if (!term) {
      setResult(null);
      setSearched(true);
      return;
    }
    setLoading(true);
    try {
      const response = await trackingApi.getByTrackingNumber(term);
      setResult(response?.data || null);
    } catch (error) {
      setResult(null);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    runSearch(query.trim());
  };

  // A shipment's printed/QR label (components/common/ShipmentQrCode.jsx)
  // encodes a link to exactly this page with ?tn=<trackingNumber> - opening
  // that link should show the result immediately, not require re-typing
  // the number that was just scanned.
  useEffect(() => {
    const tn = searchParams.get('tn');
    if (tn) runSearch(tn.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepIndex = result ? flowIndex(result.status) : -1;
  const isDelivered = result?.status === 'DELIVERED';

  const handleComplaintSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await trackingApi.submitComplaint(result.trackingNumber, complaintForm);
      toast.success('Complaint submitted - our support team will follow up.');
      setPanel(null);
      setComplaintForm({ name: '', email: '', category: 'Late delivery', description: '' });
    } catch (error) {
      toast.error(error.data?.message || error.message || 'Could not submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await trackingApi.submitReview(result.trackingNumber, reviewForm);
      toast.success('Thank you for your feedback!');
      setPanel(null);
      setReviewForm({ name: '', email: '', riderRating: 5, deliveryRating: 5, comment: '' });
    } catch (error) {
      toast.error(error.data?.message || error.message || 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="track-shell">
      <style>{styles}</style>
      <div className="track-inner">
        <div className="track-brand"><div className="track-brand-mark">E</div>EgoTECHWORLD</div>

        <div className="track-card">
          <h1 className="track-title">Track your shipment</h1>
          <p className="track-sub">Enter your tracking number to see the latest delivery status.</p>

          <form className="track-search" onSubmit={handleSearch}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="EGW-2026-00001245" />
            <button type="submit" disabled={loading}><Search size={15} /> {loading ? 'Searching…' : 'Track'}</button>
          </form>

          {searched && !result && (
            <div className="track-empty">No shipment found for "{query}". Double check the tracking number and try again.</div>
          )}

          {result && (
            <div className="track-result">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 16, color: '#12213F' }}>{result.trackingNumber}</div>
                <StatusBadge status={statusLabel(result.status)} tone={statusTone(result.status)} showIcon />
              </div>

              <p style={{ color: '#697086', fontSize: 13, margin: '0 0 8px' }}>
                Shipped to <strong>{result.recipientName}</strong> in {result.recipientCity} · {result.serviceType} service.
              </p>

              {result.driverFirstName && (
                <p style={{ color: '#12213F', fontSize: 12.5, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Truck size={14} color="#F5A524" /> Delivery rider: <strong>{result.driverFirstName}</strong>
                </p>
              )}

              {!isTerminal(result.status) && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {STATUS_FLOW.map((step, index) => (
                    <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ width: 11, height: 11, borderRadius: 999, background: index <= stepIndex ? '#0EA394' : '#E3E7EF', margin: '0 auto 6px' }} />
                      <div style={{ fontSize: 10, color: index === stepIndex ? '#12213F' : '#9AA1B4', fontWeight: index === stepIndex ? 700 : 500 }}>{statusLabel(step)}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ position: 'relative', paddingLeft: 20 }}>
                {result.history.slice().reverse().map((event, index) => (
                  <div key={index} style={{ position: 'relative', paddingBottom: 16, borderLeft: index === result.history.length - 1 ? 'none' : '2px solid #E3E7EF', marginLeft: -1, paddingLeft: 16 }}>
                    <div style={{ position: 'absolute', left: -6, top: 2, width: 11, height: 11, borderRadius: '50%', background: '#0EA394', border: '2px solid #fff', boxShadow: '0 0 0 2px #0EA394' }} />
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#12213F' }}>{event.label}</div>
                    <div style={{ fontSize: 11, color: '#9AA1B4', marginTop: 2 }}>{event.time}</div>
                  </div>
                ))}
              </div>

              <div className="track-action-row">
                <button type="button" className="track-action-btn" onClick={() => setPanel(panel === 'complaint' ? null : 'complaint')}>
                  <MessageSquareWarning size={15} /> Make a complaint
                </button>
                {isDelivered && (
                  <button type="button" className="track-action-btn" onClick={() => setPanel(panel === 'review' ? null : 'review')}>
                    <Star size={15} /> Rate this delivery
                  </button>
                )}
              </div>

              {panel === 'complaint' && (
                <form className="track-form" onSubmit={handleComplaintSubmit}>
                  <label>Name</label>
                  <input required value={complaintForm.name} onChange={(e) => setComplaintForm((f) => ({ ...f, name: e.target.value }))} />
                  <label>Email</label>
                  <input required type="email" value={complaintForm.email} onChange={(e) => setComplaintForm((f) => ({ ...f, email: e.target.value }))} />
                  <label>Complaint type</label>
                  <select value={complaintForm.category} onChange={(e) => setComplaintForm((f) => ({ ...f, category: e.target.value }))}>
                    <option>Late delivery</option>
                    <option>Lost package</option>
                    <option>Damaged package</option>
                    <option>Wrong delivery</option>
                    <option>Missing COD</option>
                    <option>Incorrect charge</option>
                    <option>Driver behavior</option>
                    <option>Address issue</option>
                    <option>Other</option>
                  </select>
                  <label>Complaint description</label>
                  <textarea required rows={4} value={complaintForm.description} onChange={(e) => setComplaintForm((f) => ({ ...f, description: e.target.value }))} />
                  <button type="submit" className="track-form-submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit complaint'}</button>
                </form>
              )}

              {panel === 'review' && isDelivered && (
                <form className="track-form" onSubmit={handleReviewSubmit}>
                  <label>Name</label>
                  <input required value={reviewForm.name} onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))} />
                  <label>Email</label>
                  <input required type="email" value={reviewForm.email} onChange={(e) => setReviewForm((f) => ({ ...f, email: e.target.value }))} />
                  <StarPicker label="Staff / rider rating" value={reviewForm.riderRating} onChange={(n) => setReviewForm((f) => ({ ...f, riderRating: n }))} />
                  <StarPicker label="Delivery experience rating" value={reviewForm.deliveryRating} onChange={(n) => setReviewForm((f) => ({ ...f, deliveryRating: n }))} />
                  <label>Review / comment</label>
                  <textarea rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} />
                  <button type="submit" className="track-form-submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit review'}</button>
                </form>
              )}
            </div>
          )}

          {!searched && (
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10, color: '#9AA1B4', fontSize: 12 }}>
              <PackageSearch size={15} /> Try EGW-2026-00001245 as an example.
            </div>
          )}
        </div>

        {!PORTAL_ROLE && <Link to="/login" className="track-back"><ArrowLeft size={13} /> Back to sign in</Link>}
      </div>
    </div>
  );
}
