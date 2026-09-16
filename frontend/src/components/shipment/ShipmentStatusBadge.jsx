import React from 'react';

const styles = `
  .shipment-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 999px;
    letter-spacing: .01em;
    line-height: 1;
    white-space: nowrap;
  }

  .shipment-status-badge .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }

  .status-teal {
    background: #E4F7F4;
    color: #087367;
  }

  .status-teal .dot {
    background: #0EA394;
  }

  .status-amber {
    background: #FCEFD6;
    color: #8A5A05;
  }

  .status-amber .dot {
    background: #D9860F;
  }

  .status-coral {
    background: #FDE9E7;
    color: #B23528;
  }

  .status-coral .dot {
    background: #EF5B4E;
  }

  .status-sky {
    background: #E8EFFE;
    color: #2453B8;
  }

  .status-sky .dot {
    background: #3E7BFA;
  }

  .status-grey {
    background: #EEF0F4;
    color: #697086;
  }

  .status-grey .dot {
    background: #9AA1B4;
  }
`;

const statusMap = {
  delivered: 'status-teal',
  'out for delivery': 'status-amber',
  delayed: 'status-coral',
  'in transit': 'status-sky',
  'awaiting pickup': 'status-grey',
  'pickup pending': 'status-amber',
  default: 'status-sky',
};

function normalizeStatus(status) {
  if (!status) return 'default';
  const value = String(status).trim().toLowerCase();
  return statusMap[value] ? value : 'default';
}

export default function ShipmentStatusBadge({ status = 'In transit', className = '', style = {} }) {
  const normalized = normalizeStatus(status);
  const variant = statusMap[normalized] || 'status-sky';

  return (
    <span className={`shipment-status-badge ${variant} ${className}`.trim()} style={style}>
      <span className="dot" />
      {status}
    </span>
  );
}
