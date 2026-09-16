import React, { useState } from 'react';

const styles = `
  .pickup-form-shell {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 16px;
    padding: 22px 20px 18px;
    box-shadow: 0 10px 25px rgba(18, 33, 63, 0.04);
  }

  .pickup-form-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .pickup-form-title {
    margin: 0;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 17px;
    color: #12213F;
  }

  .pickup-form-subtitle {
    margin: 4px 0 0;
    font-size: 12.5px;
    color: #697086;
  }

  .pickup-form-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 110px;
    padding: 8px 12px;
    border-radius: 999px;
    background: #EFF7FF;
    color: #2453B8;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .pickup-section {
    padding-top: 18px;
    margin-top: 20px;
    border-top: 1px solid #E3E7EF;
  }

  .pickup-section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: #12213F;
  }

  .pickup-section-number {
    width: 24px;
    height: 24px;
    border-radius: 7px;
    background: #F5A524;
    color: #211200;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
  }

  .pickup-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .pickup-grid.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field label {
    font-size: 12px;
    font-weight: 600;
    color: #697086;
  }

  .field input,
  .field select,
  .field textarea {
    width: 100%;
    border: 1.5px solid #E3E7EF;
    border-radius: 10px;
    background: #fff;
    color: #151A2E;
    font-size: 13px;
    padding: 10px 12px;
    min-height: 44px;
    font-family: 'Inter', sans-serif;
    resize: vertical;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    outline: none;
    border-color: #F5A524;
    box-shadow: 0 0 0 4px rgba(245, 165, 36, 0.12);
  }

  .field input::placeholder,
  .field textarea::placeholder {
    color: #9AA1B4;
  }

  .pickup-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid #E3E7EF;
  }

  .pickup-button {
    appearance: none;
    border: none;
    border-radius: 10px;
    padding: 11px 18px;
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: transform 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .pickup-button:hover {
    transform: translateY(-1px);
  }

  .pickup-button.secondary {
    background: #fff;
    color: #12213F;
    border: 1px solid #E3E7EF;
  }

  .pickup-button.primary {
    background: #F5A524;
    color: #211200;
  }

  @media (max-width: 720px) {
    .pickup-grid,
    .pickup-grid.three {
      grid-template-columns: 1fr;
    }

    .pickup-form-header,
    .pickup-form-actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

const defaultValues = {
  requestId: 'PU-2048',
  customer: 'Urban Mart',
  contactName: 'Ayesha Perera',
  contactPhone: '+94 77 402 1963',
  pickupAddress: 'No. 22, Galle Road, Colombo 07',
  pickupDate: '2026-09-07',
  pickupTime: '09:00',
  pickupType: 'Courier pickup',
  packageCount: '8',
  estimatedWeight: '28 kg',
  note: '',
};

export default function PickupRequestForm({ initialValues = {}, onSubmit, onSaveDraft }) {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  const handleDraft = () => {
    if (onSaveDraft) onSaveDraft(form);
  };

  return (
    <form className="pickup-form-shell" onSubmit={handleSubmit}>
      <style>{styles}</style>

      <div className="pickup-form-header">
        <div>
          <h3 className="pickup-form-title">Pickup request</h3>
          <p className="pickup-form-subtitle">Schedule collection from merchants, residential points, or hubs.</p>
        </div>

        <div className="pickup-form-badge">New request</div>
      </div>

      <div className="pickup-grid three">
        <div className="field">
          <label htmlFor="requestId">Request ID</label>
          <input id="requestId" name="requestId" value={form.requestId} onChange={handleChange} readOnly />
        </div>

        <div className="field">
          <label htmlFor="customer">Customer / Merchant</label>
          <input id="customer" name="customer" value={form.customer} onChange={handleChange} placeholder="Urban Mart" />
        </div>

        <div className="field">
          <label htmlFor="pickupType">Pickup type</label>
          <select id="pickupType" name="pickupType" value={form.pickupType} onChange={handleChange}>
            <option value="Courier pickup">Courier pickup</option>
            <option value="Store collection">Store collection</option>
            <option value="Hub transfer">Hub transfer</option>
            <option value="Scheduled callback">Scheduled callback</option>
          </select>
        </div>
      </div>

      <div className="pickup-section">
        <div className="pickup-section-title">
          <span className="pickup-section-number">1</span>
          <span>Pickup contact</span>
        </div>

        <div className="pickup-grid">
          <div className="field">
            <label htmlFor="contactName">Contact name</label>
            <input id="contactName" name="contactName" value={form.contactName} onChange={handleChange} placeholder="Ayesha Perera" />
          </div>

          <div className="field">
            <label htmlFor="contactPhone">Contact phone</label>
            <input id="contactPhone" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+94 77 402 1963" />
          </div>
        </div>
      </div>

      <div className="pickup-section">
        <div className="pickup-section-title">
          <span className="pickup-section-number">2</span>
          <span>Collection details</span>
        </div>

        <div className="pickup-grid">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="pickupAddress">Pickup address</label>
            <input id="pickupAddress" name="pickupAddress" value={form.pickupAddress} onChange={handleChange} placeholder="No. 22, Galle Road, Colombo 07" />
          </div>

          <div className="field">
            <label htmlFor="pickupDate">Preferred date</label>
            <input id="pickupDate" name="pickupDate" type="date" value={form.pickupDate} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="pickupTime">Preferred time</label>
            <input id="pickupTime" name="pickupTime" type="time" value={form.pickupTime} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="packageCount">Package count</label>
            <input id="packageCount" name="packageCount" value={form.packageCount} onChange={handleChange} placeholder="8" />
          </div>

          <div className="field">
            <label htmlFor="estimatedWeight">Estimated weight</label>
            <input id="estimatedWeight" name="estimatedWeight" value={form.estimatedWeight} onChange={handleChange} placeholder="28 kg" />
          </div>
        </div>
      </div>

      <div className="pickup-section">
        <div className="pickup-section-title">
          <span className="pickup-section-number">3</span>
          <span>Instructions</span>
        </div>

        <div className="pickup-grid">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="note">Pickup note</label>
            <textarea id="note" name="note" value={form.note} onChange={handleChange} rows="3" placeholder="Add any collection instructions, access notes, or security details." />
          </div>
        </div>
      </div>

      <div className="pickup-form-actions">
        <button type="button" className="pickup-button secondary" onClick={handleDraft}>
          Save draft
        </button>

        <button type="submit" className="pickup-button primary">
          Schedule pickup
        </button>
      </div>
    </form>
  );
}
