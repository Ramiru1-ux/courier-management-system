import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';
import { getNameError, getAddressError, filterNameInput, filterAddressInput } from '../../utils/textValidation';

const initial = {
  senderName: '',
  senderPhone: '',
  senderAddress: '',
  branch: '',
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
  recipientCity: '',
  serviceType: 'Standard',
  weight: '',
  codAmount: '',
};

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { branches, createShipment } = useStore();
  const [form, setForm] = useState(() => ({
    ...initial,
    senderName: user?.merchantName || user?.name || '',
    // Defaults to the signed-in user's OWN branch when they have one (every
    // branch/counter account does - see models/User.js branchName) rather
    // than always the first branch in the list. This matters for counter
    // staff specifically: the backend only accepts a new shipment from a
    // counter/branch account when its `branch` field matches their own
    // (SCOPED_OWNERSHIP.shipments in roleScope.js) - defaulting to the
    // wrong branch would have made their own "create shipment" silently
    // rejected.
    branch: user?.branch || branches[0]?.name || '',
  }));
  const [error, setError] = useState('');

  const update = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Sri Lankan phone numbers are 10 digits (e.g. 0771234567) - strip
  // anything non-numeric as the user types and cap the length so the field
  // can't end up with letters or a long run of digits like "07773185822222".
  const updatePhone = (event) => {
    const { name, value } = event.target;
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, [name]: digits }));
  };

  // Names and addresses are filtered the same way as the phone field above:
  // a character that does not belong in one cannot be typed into it. The
  // checks in handleSubmit then catch what a filter cannot (an empty or
  // over-long value), and the same rules are enforced server-side in
  // backend/validators/shipmentDataValidator.js for anything reaching the
  // API another way.
  const updateName = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: filterNameInput(value) }));
  };

  // Used for addresses and for place fields such as the destination city,
  // which legitimately carry digits ("Colombo 03") and so cannot take the
  // letters-only name rule.
  const updateAddress = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: filterAddressInput(value) }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.recipientName || !form.recipientPhone || !form.recipientCity) {
      setError('Recipient name, phone and destination city are required.');
      return;
    }
    const fieldError = getNameError(form.senderName, 'Sender name', { required: false })
      || getNameError(form.recipientName, 'Recipient name')
      || getAddressError(form.recipientCity, 'Destination city')
      || getAddressError(form.senderAddress, 'Origin address', { required: false })
      || getAddressError(form.recipientAddress, 'Destination address', { required: false });
    if (fieldError) {
      setError(fieldError);
      return;
    }
    setError('');
    const created = createShipment(form);
    toast.success(`Shipment created: ${created.trackingNumber}`);
    navigate(`/shipments/${created.id}`);
  };

  const field = (label, name, extra = {}) => (
    <div className="field">
      <label>{label}</label>
      <input name={name} value={form[name]} onChange={update} {...extra} />
    </div>
  );

  return (
    <PortalLayout>
      <style>{`
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .field label { font-size: 12px; font-weight: 600; color: #697086; }
        .field input, .field select { border: 1.5px solid #E3E7EF; border-radius: 9px; padding: 10px 12px; font-size: 13px; color: #151A2E; background: #fff; }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
        .form-grid.three { grid-template-columns: repeat(3, minmax(0,1fr)); }
        @media (max-width: 720px) { .form-grid, .form-grid.three { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Shipments / <b style={{ color: '#697086' }}>Create</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Create shipment</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: '22px 26px' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 3 }}>Sender details</div>
        <p style={{ fontSize: 12, color: '#697086', margin: '0 0 16px' }}>Who is shipping the package.</p>
        <div className="form-grid">
          {field('Sender name', 'senderName', { placeholder: 'Sanduni Traders', onChange: updateName })}
          {field('Sender phone', 'senderPhone', { placeholder: '0771123344', onChange: updatePhone, inputMode: 'numeric', maxLength: 10 })}
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Pickup branch</label>
            <select name="branch" value={form.branch} onChange={update}>
              {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          {field('Origin address', 'senderAddress', { placeholder: 'No. 8, Galle Road, Colombo 3', onChange: updateAddress })}
        </div>

        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', margin: '20px 0 3px' }}>Recipient details</div>
        <p style={{ fontSize: 12, color: '#697086', margin: '0 0 16px' }}>Where the package is going.</p>
        <div className="form-grid">
          {field('Recipient name', 'recipientName', { placeholder: 'Pasan Perera', required: true, onChange: updateName })}
          {field('Recipient phone', 'recipientPhone', { placeholder: '0715542233', required: true, onChange: updatePhone, inputMode: 'numeric', maxLength: 10 })}
        </div>
        <div className="form-grid">
          {field('Destination city', 'recipientCity', { placeholder: 'Kandy', required: true, onChange: updateAddress })}
          {field('Destination address', 'recipientAddress', { placeholder: '21 Temple Road', onChange: updateAddress })}
        </div>

        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', margin: '20px 0 3px' }}>Pricing & logistics</div>
        <p style={{ fontSize: 12, color: '#697086', margin: '0 0 16px' }}>Service level, weight and cash-on-delivery amount.</p>
        <div className="form-grid three">
          <div className="field">
            <label>Service type</label>
            <select name="serviceType" value={form.serviceType} onChange={update}>
              <option>Standard</option>
              <option>Express</option>
              <option>Priority</option>
              <option>Same-Day</option>
              <option>Regional</option>
            </select>
          </div>
          {field('Weight (kg)', 'weight', { placeholder: '1.8', type: 'number', step: '0.1', min: '0' })}
          {field('COD amount (Rs)', 'codAmount', { placeholder: '2300', type: 'number', min: '0' })}
        </div>

        {error && <div style={{ color: '#B23528', fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button type="button" variant="secondary" onClick={() => navigate('/shipments')}>Cancel</Button>
          <Button type="submit" variant="accent">Create shipment</Button>
        </div>
      </form>
    </PortalLayout>
  );
}
