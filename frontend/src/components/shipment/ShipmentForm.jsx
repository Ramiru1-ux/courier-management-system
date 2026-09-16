import React, { useState } from 'react';

const styles = `
  .shipment-form-shell {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 16px;
    padding: 22px 20px 18px;
    box-shadow: 0 10px 25px rgba(18, 33, 63, 0.04);
  }

  .shipment-form-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .shipment-form-title {
    margin: 0;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 17px;
    color: #12213F;
  }

  .shipment-form-subtitle {
    margin: 4px 0 0;
    font-size: 12.5px;
    color: #697086;
  }

  .shipment-form-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 108px;
    padding: 8px 12px;
    border-radius: 999px;
    background: #EFF7FF;
    color: #2453B8;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .shipment-section {
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid #E3E7EF;
  }

  .shipment-section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: #12213F;
  }

  .shipment-section-number {
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

  .shipment-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .shipment-grid.three {
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
    resize: vertical;
    min-height: 44px;
    font-family: 'Inter', sans-serif;
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

  .shipment-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid #E3E7EF;
  }

  .shipment-button {
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

  .shipment-button:hover {
    transform: translateY(-1px);
  }

  .shipment-button.secondary {
    background: #fff;
    color: #12213F;
    border: 1px solid #E3E7EF;
  }

  .shipment-button.primary {
    background: #F5A524;
    color: #211200;
  }

  @media (max-width: 720px) {
    .shipment-grid,
    .shipment-grid.three {
      grid-template-columns: 1fr;
    }

    .shipment-form-header,
    .shipment-form-actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

const defaultValues = {
  trackingNumber: 'AUTO-092184',
  serviceType: 'priority',
  packageType: 'parcel',
  senderName: 'Nimal Silva',
  senderPhone: '+94 77 112 3344',
  pickupBranch: 'Colombo Central',
  senderAddress: 'No. 5, Galle Road',
  recipientName: 'Pasan Perera',
  recipientPhone: '+94 71 554 2233',
  destinationCity: 'Kandy',
  destinationAddress: '21, Temple Road',
  weight: '1.8 kg',
  declaredValue: 'Rs 5,500',
  codAmount: 'Rs 2,300',
  notes: '',
};

export default function ShipmentForm({ initialValues = {}, onSubmit, onSaveDraft }) {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (onSubmit) {
      onSubmit(form);
    }
  };

  const handleDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(form);
    }
  };

  return (
    <form className="shipment-form-shell" onSubmit={handleSubmit}>
      <style>{styles}</style>

      <div className="shipment-form-header">
        <div>
          <h3 className="shipment-form-title">Shipment details</h3>
          <p className="shipment-form-subtitle">Capture sender, recipient, route, and service information.</p>
        </div>

        <div className="shipment-form-badge">Draft</div>
      </div>

      <div className="shipment-grid three">
        <div className="field">
          <label htmlFor="trackingNumber">Tracking number</label>
          <input id="trackingNumber" name="trackingNumber" value={form.trackingNumber} onChange={handleChange} readOnly />
        </div>

        <div className="field">
          <label htmlFor="serviceType">Service type</label>
          <select id="serviceType" name="serviceType" value={form.serviceType} onChange={handleChange}>
            <option value="priority">Priority Express</option>
            <option value="standard">Standard</option>
            <option value="same-day">Same-Day</option>
            <option value="international">International</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="packageType">Package type</label>
          <select id="packageType" name="packageType" value={form.packageType} onChange={handleChange}>
            <option value="parcel">Parcel</option>
            <option value="document">Document</option>
            <option value="fragile">Fragile</option>
            <option value="bulk">Bulk</option>
          </select>
        </div>
      </div>

      <div className="shipment-section">
        <div className="shipment-section-title">
          <span className="shipment-section-number">1</span>
          <span>Sender details</span>
        </div>

        <div className="shipment-grid">
          <div className="field">
            <label htmlFor="senderName">Sender name</label>
            <input id="senderName" name="senderName" value={form.senderName} onChange={handleChange} placeholder="Nimal Silva" />
          </div>

          <div className="field">
            <label htmlFor="senderPhone">Sender phone</label>
            <input id="senderPhone" name="senderPhone" value={form.senderPhone} onChange={handleChange} placeholder="+94 77 112 3344" />
          </div>

          <div className="field">
            <label htmlFor="pickupBranch">Pickup branch</label>
            <select id="pickupBranch" name="pickupBranch" value={form.pickupBranch} onChange={handleChange}>
              <option value="Colombo Central">Colombo Central</option>
              <option value="Kandy Hub">Kandy Hub</option>
              <option value="Galle Depot">Galle Depot</option>
              <option value="Negombo Office">Negombo Office</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="senderAddress">Sender address</label>
            <input id="senderAddress" name="senderAddress" value={form.senderAddress} onChange={handleChange} placeholder="No. 5, Galle Road" />
          </div>
        </div>
      </div>

      <div className="shipment-section">
        <div className="shipment-section-title">
          <span className="shipment-section-number">2</span>
          <span>Recipient details</span>
        </div>

        <div className="shipment-grid">
          <div className="field">
            <label htmlFor="recipientName">Recipient name</label>
            <input id="recipientName" name="recipientName" value={form.recipientName} onChange={handleChange} placeholder="Pasan Perera" />
          </div>

          <div className="field">
            <label htmlFor="recipientPhone">Recipient phone</label>
            <input id="recipientPhone" name="recipientPhone" value={form.recipientPhone} onChange={handleChange} placeholder="+94 71 554 2233" />
          </div>

          <div className="field">
            <label htmlFor="destinationCity">Destination city</label>
            <select id="destinationCity" name="destinationCity" value={form.destinationCity} onChange={handleChange}>
              <option value="Kandy">Kandy</option>
              <option value="Galle">Galle</option>
              <option value="Jaffna">Jaffna</option>
              <option value="Colombo">Colombo</option>
              <option value="Matara">Matara</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="destinationAddress">Destination address</label>
            <input id="destinationAddress" name="destinationAddress" value={form.destinationAddress} onChange={handleChange} placeholder="21, Temple Road" />
          </div>
        </div>
      </div>

      <div className="shipment-section">
        <div className="shipment-section-title">
          <span className="shipment-section-number">3</span>
          <span>Pricing & logistics</span>
        </div>

        <div className="shipment-grid three">
          <div className="field">
            <label htmlFor="weight">Weight</label>
            <input id="weight" name="weight" value={form.weight} onChange={handleChange} placeholder="1.8 kg" />
          </div>

          <div className="field">
            <label htmlFor="declaredValue">Declared value</label>
            <input id="declaredValue" name="declaredValue" value={form.declaredValue} onChange={handleChange} placeholder="Rs 5,500" />
          </div>

          <div className="field">
            <label htmlFor="codAmount">COD amount</label>
            <input id="codAmount" name="codAmount" value={form.codAmount} onChange={handleChange} placeholder="Rs 2,300" />
          </div>
        </div>

        <div className="shipment-grid" style={{ marginTop: '16px' }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="notes">Delivery notes</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Add any instructions, access notes, or payment details." rows="3" />
          </div>
        </div>
      </div>

      <div className="shipment-form-actions">
        <button type="button" className="shipment-button secondary" onClick={handleDraft}>
          Save draft
        </button>

        <button type="submit" className="shipment-button primary">
          Create shipment
        </button>
      </div>
    </form>
  );
}
