import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { apiRequest } from '../../api/axiosInstance';

const styles = `.public-page{min-height:100vh;background:#F3F5F9}.public-header{display:flex;align-items:center;justify-content:space-between;padding:0 6vw;min-height:68px;border-bottom:1px solid #E3E7EF;background:#fff}.public-brand{display:flex;align-items:center;gap:9px;color:#12213F;font:800 15px 'Sora',sans-serif}.brand-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#F5A524;color:#211200}.public-link{color:#697086;font-size:12px;font-weight:700;text-decoration:none}.public-main{width:min(900px,calc(100% - 40px));margin:0 auto;padding:42px 0}.public-title{margin:0;color:#12213F;font:800 34px 'Sora',sans-serif}.public-copy{margin:10px 0 24px;color:#697086;font-size:14px;line-height:1.6}.support-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:16px}.contact-card,.support-form{padding:20px;border:1px solid #E3E7EF;border-radius:14px;background:#fff}.contact-card h2,.support-form h2{margin:0 0 16px;color:#12213F;font:700 15px 'Sora',sans-serif}.contact-row{display:flex;gap:10px;padding:12px 0;border-top:1px solid #E3E7EF;color:#12213F;font-size:12.5px}.contact-row svg{color:#3E7BFA}.contact-row small{display:block;margin-top:3px;color:#697086}.fields{display:grid;gap:13px}.field{display:grid;gap:6px}.field label{color:#697086;font-size:11px;font-weight:700}.field input,.field textarea{width:100%;border:1px solid #E3E7EF;border-radius:9px;padding:10px 12px;background:#F9FAFC;color:#12213F;font-size:13px;outline:0}.field textarea{min-height:110px;resize:vertical}.support-submit{display:inline-flex;align-items:center;gap:7px;margin-top:16px;border:0;border-radius:9px;padding:11px 14px;background:#12213F;color:#fff;font-size:12px;font-weight:700;cursor:pointer}.support-submit:disabled{opacity:.6;cursor:not-allowed}.support-success{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:10px;border-radius:9px;background:#E4F7F4;color:#087367;font-size:12px;font-weight:700}.support-error{margin-bottom:12px;padding:10px;border-radius:9px;background:#FDE9E7;color:#B23528;font-size:12px;font-weight:700}@media(max-width:720px){.public-main{padding:24px 0}.support-grid{grid-template-columns:1fr}}`;

/**
 * Real, persisted public contact form - POST /api/public-contact (no
 * account/JWT involved, since an anonymous visitor has neither). Previously
 * this form's onSubmit only called setSent(true) with no persistence at
 * all, and its inputs were not even wired to React state - a fabricated
 * success response the client couldn't tell apart from a real one.
 */
export default function ContactSupportPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiRequest(api.post('/public-contact', form));
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message || 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="public-page"><style>{styles}</style><header className="public-header"><Link className="public-brand" to="/welcome"><span className="brand-mark">E</span>EGOTECHWORLD</Link><Link className="public-link" to="/track"><ArrowLeft size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Track shipment</Link></header><div className="public-main"><h1 className="public-title">Contact support</h1><p className="public-copy">Our support team can help with shipments, payments, returns, and account questions.</p><div className="support-grid"><section className="contact-card"><h2>Reach our team</h2><div className="contact-row"><Mail size={17} /><div>Email<small>support@egotech.com</small></div></div><div className="contact-row"><Phone size={17} /><div>Phone<small>+94 11 234 5678 · 8 AM - 8 PM</small></div></div><div className="contact-row"><MessageCircle size={17} /><div>Live chat<small>Average response under 5 minutes</small></div></div></section><form className="support-form" onSubmit={handleSubmit}><h2>Send a message</h2>{sent ? <div className="support-success"><CheckCircle2 size={15} /> Message sent. We&apos;ll be in touch shortly.</div> : null}{error ? <div className="support-error">{error}</div> : null}<div className="fields"><div className="field"><label htmlFor="support-name">Name</label><input id="support-name" required placeholder="Your name" value={form.name} onChange={update('name')} /></div><div className="field"><label htmlFor="support-email">Email</label><input id="support-email" type="email" required placeholder="you@example.com" value={form.email} onChange={update('email')} /></div><div className="field"><label htmlFor="support-message">Message</label><textarea id="support-message" required placeholder="How can we help?" value={form.message} onChange={update('message')} /></div></div><button className="support-submit" type="submit" disabled={submitting}><Send size={14} /> {submitting ? 'Sending...' : 'Send message'}</button></form></div></div></main>;
}
