import React from 'react';
import { PackageCheck, WalletCards } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import PackageList from '../../components/shipment/PackageList';
import ShipmentStatusBadge from '../../components/shipment/ShipmentStatusBadge';
import ShipmentTimeline from '../../components/shipment/ShipmentTimeline';

const styles = `
  .shipment-details-page {
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

  .page-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .action-button {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 13.5px;
    border-radius: 10px;
    padding: 11px 18px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s ease;
  }

  .action-button:hover {
    transform: translateY(-1px);
  }

  .action-button.secondary {
    background: #fff;
    color: #12213F;
    border: 1px solid #E3E7EF;
  }

  .action-button.primary {
    background: #F5A524;
    color: #211200;
  }

  .top-grid {
    display: grid;
    grid-template-columns: 1.35fr 0.95fr;
    gap: 16px;
  }

  .panel {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 18px 20px;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .panel-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    color: #12213F;
  }

  .panel-link {
    font-size: 12px;
    font-weight: 600;
    color: #3E7BFA;
  }

  .progress-steps {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 18px;
  }

  .step {
    text-align: center;
  }

  .step-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin: 0 auto 8px;
    background: #E3E7EF;
  }

  .step.done .step-dot {
    background: #0EA394;
  }

  .step.current .step-dot {
    background: #F5A524;
  }

  .step-label {
    font-size: 11px;
    color: #697086;
    font-weight: 500;
  }

  .step.current .step-label {
    color: #12213F;
    font-weight: 700;
  }

  .summary-list {
    display: grid;
    gap: 12px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid #E3E7EF;
    padding-bottom: 8px;
  }

  .summary-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .summary-label {
    font-size: 12px;
    color: #697086;
  }

  .summary-value {
    font-size: 13px;
    color: #12213F;
    font-weight: 600;
    text-align: right;
  }

  .proof-panel {
    padding: 18px 20px;
  }

  .proof-body {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 18px;
    align-items: center;
  }

  .proof-copy {
    margin: 0;
    color: #697086;
    line-height: 1.6;
    font-size: 13px;
  }

  .proof-actions {
    display: grid;
    gap: 10px;
  }

  .mini-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 999px;
    width: fit-content;
  }

  .mini-badge .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }

  .mini-badge.teal {
    background: #E4F7F4;
    color: #087367;
  }

  .mini-badge.teal .dot {
    background: #0EA394;
  }

  .mini-badge.amber {
    background: #FCEFD6;
    color: #8A5A05;
  }

  .mini-badge.amber .dot {
    background: #D9860F;
  }

  .mini-badge.grey {
    background: #EEF0F4;
    color: #697086;
  }

  .mini-badge.grey .dot {
    background: #9AA1B4;
  }

  @media (max-width: 900px) {
    .top-grid,
    .proof-body {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .page-head {
      flex-direction: column;
      align-items: flex-start;
    }

    .page-actions {
      width: 100%;
      flex-wrap: wrap;
    }

    .progress-steps {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

const shipmentSummary = [
  { label: 'Tracking ID', value: 'SH-28491' },
  { label: 'Service', value: 'Priority Express' },
  { label: 'Status', value: 'In transit' },
  { label: 'COD amount', value: 'Rs 1,250' },
  { label: 'Destination', value: 'Kandy' },
  { label: 'Driver', value: 'A. Fernando' },
];

const timelineItems = [
  { title: 'Picked up by courier', meta: '12:40 PM · Vehicle #LK-1738', status: 'done' },
  { title: 'Sorting hub scanned', meta: '1:05 PM · Central Hub, Colombo', status: 'done' },
  { title: 'Out for delivery', meta: '2:10 PM · Route 04 · Driver A. Fernando', status: 'current' },
  { title: 'Customer confirmation pending', meta: 'Expected by 4:30 PM', status: 'pending' },
];

const packageItems = [
  { id: 'PKG-01', name: 'Electronics parcel', type: 'Parcel', weight: '1.8 kg', status: 'In transit', destination: 'Kandy' },
  { id: 'PKG-02', name: 'Office documents', type: 'Document', weight: '0.7 kg', status: 'Delivered', destination: 'Colombo' },
  { id: 'PKG-03', name: 'Gift box', type: 'Fragile', weight: '2.4 kg', status: 'Pickup pending', destination: 'Galle' },
];

export default function ShipmentDetailsPage() {
  return (
    <PortalLayout>
      <div className="shipment-details-page">
        <style>{styles}</style>

        <div className="page-head">
          <div>
            <div className="breadcrumb">Shipments / <strong>SH-28491</strong></div>
            <h1 className="page-title">Shipment details</h1>
          </div>

          <div className="page-actions">
            <button type="button" className="action-button secondary">
              <PackageCheck size={15} />
              POD
            </button>
            <button type="button" className="action-button primary">
              <WalletCards size={15} />
              COD
            </button>
          </div>
        </div>

        <div className="top-grid">
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Route timeline</div>
              <div className="panel-link">Track live</div>
            </div>

            <div className="progress-steps">
              {['Pickup', 'Hub scan', 'In transit', 'Out for delivery', 'Delivered'].map((step, index) => (
                <div key={step} className={`step ${index < 3 ? 'done' : index === 3 ? 'current' : ''}`}>
                  <div className="step-dot" />
                  <div className="step-label">{step}</div>
                </div>
              ))}
            </div>

            <ShipmentTimeline items={timelineItems} />
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Shipment summary</div>
              <ShipmentStatusBadge status="In transit" />
            </div>

            <div className="summary-list">
              {shipmentSummary.map((item) => (
                <div key={item.label} className="summary-row">
                  <span className="summary-label">{item.label}</span>
                  <span className="summary-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel proof-panel">
          <div className="panel-head">
            <div className="panel-title">Delivery proof & COD reconciliation</div>
            <div className="panel-link">Latest activity</div>
          </div>

          <div className="proof-body">
            <div>
              <p className="proof-copy">
                Driver confirmation and proof of delivery are ready for payout review. Customer signature has been captured and the COD settlement is awaiting approval.
              </p>
            </div>

            <div className="proof-actions">
              <span className="mini-badge teal"><span className="dot" />POD approved</span>
              <span className="mini-badge amber"><span className="dot" />COD due today</span>
              <span className="mini-badge grey"><span className="dot" />Customer signed</span>
            </div>
          </div>
        </div>

        <PackageList packages={packageItems} />
      </div>
    </PortalLayout>
  );
}
