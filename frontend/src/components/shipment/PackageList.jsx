import React from 'react';

const styles = `
  .package-list {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 18px 20px;
  }

  .package-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .package-list-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    color: #12213F;
  }

  .package-list-count {
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: #697086;
    background: #F3F5F9;
    border: 1px solid #E3E7EF;
    border-radius: 999px;
    padding: 6px 10px;
  }

  .package-item {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr 0.8fr auto;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-top: 1px solid #E3E7EF;
  }

  .package-item:first-child {
    border-top: none;
  }

  .pkg-name {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pkg-name strong {
    font-size: 13px;
    color: #12213F;
  }

  .pkg-name span {
    font-size: 11.5px;
    color: #9AA1B4;
  }

  .pkg-meta {
    font-size: 12.5px;
    color: #697086;
  }

  .pkg-weight {
    font-size: 12.5px;
    color: #12213F;
    font-weight: 600;
  }

  .pkg-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 600;
  }

  .pkg-status .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
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

  .status-sky {
    background: #E8EFFE;
    color: #2453B8;
  }

  .status-sky .dot {
    background: #3E7BFA;
  }

  .status-coral {
    background: #FDE9E7;
    color: #B23528;
  }

  .status-coral .dot {
    background: #EF5B4E;
  }

  @media (max-width: 640px) {
    .package-item {
      grid-template-columns: 1fr;
      align-items: flex-start;
    }

    .package-list-header {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`;

function getStatusClass(status) {
  if (status === 'Delivered') return 'status-teal';
  if (status === 'In transit') return 'status-sky';
  if (status === 'Pickup pending') return 'status-amber';
  if (status === 'Delayed') return 'status-coral';
  return 'status-sky';
}

export default function PackageList({ packages = [] }) {
  const data = packages.length
    ? packages
    : [
        { id: 'PKG-01', name: 'Electronics parcel', type: 'Parcel', weight: '1.8 kg', status: 'In transit', destination: 'Kandy' },
        { id: 'PKG-02', name: 'Office documents', type: 'Document', weight: '0.7 kg', status: 'Delivered', destination: 'Colombo' },
        { id: 'PKG-03', name: 'Gift box', type: 'Fragile', weight: '2.4 kg', status: 'Pickup pending', destination: 'Galle' },
        { id: 'PKG-04', name: 'Medical supplies', type: 'Cold chain', weight: '3.1 kg', status: 'Delayed', destination: 'Jaffna' },
      ];

  return (
    <div className="package-list">
      <style>{styles}</style>

      <div className="package-list-header">
        <div className="package-list-title">Package list</div>
        <div className="package-list-count">{data.length} items</div>
      </div>

      {data.map((item) => (
        <div key={item.id || item.name} className="package-item">
          <div className="pkg-name">
            <strong>{item.name}</strong>
            <span>{item.id}</span>
          </div>

          <div className="pkg-meta">{item.type} · {item.destination}</div>
          <div className="pkg-weight">{item.weight}</div>

          <span className={`pkg-status ${getStatusClass(item.status)}`}>
            <span className="dot" />
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}
