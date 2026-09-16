import React, { useState } from 'react';
import PortalLayout from '../../components/layout/PortalLayout';
import ShipmentForm from '../../components/shipment/ShipmentForm';

const styles = `
  .create-shipment-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .page-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .breadcrumb {
    font-size: 12px;
    color: #9AA1B4;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .breadcrumb strong {
    color: #697086;
  }

  .page-title {
    margin: 0;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 21px;
    color: #12213F;
  }

  .page-subtitle {
    margin: 6px 0 0;
    font-size: 13px;
    color: #697086;
  }

  .status-banner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #E7F9F3;
    color: #0C8C6B;
    border: 1px solid #BFEBD9;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  @media (max-width: 640px) {
    .page-head {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

export default function CreateShipmentPage() {
  const [lastSaved, setLastSaved] = useState('');

  const handleSubmit = (values) => {
    setLastSaved(`Last shipment created: ${values.trackingNumber}`);
    console.log('Create shipment payload:', values);
  };

  const handleSaveDraft = (values) => {
    setLastSaved(`Draft saved: ${values.trackingNumber}`);
    console.log('Draft payload:', values);
  };

  return (
    <PortalLayout>
      <div className="create-shipment-page">
        <style>{styles}</style>

        <div className="page-head">
          <div>
            <div className="breadcrumb">Shipments / <strong>Create</strong></div>
            <h1 className="page-title">Create shipment</h1>
            <p className="page-subtitle">Register a new parcel, capture routing details, and prepare it for pickup.</p>
          </div>

          {lastSaved ? <div className="status-banner">{lastSaved}</div> : null}
        </div>

        <ShipmentForm onSubmit={handleSubmit} onSaveDraft={handleSaveDraft} />
      </div>
    </PortalLayout>
  );
}
