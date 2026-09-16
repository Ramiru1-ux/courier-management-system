import React from 'react';

const styles = `
  .alerts-panel {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 18px 20px;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .panel-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    color: #12213F;
  }

  .link-sm {
    font-size: 12px;
    font-weight: 600;
    color: #3E7BFA;
  }

  .alert-list {
    display: grid;
    gap: 12px;
  }

  .alert-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 10px;
    border: 1px solid #E3E7EF;
    border-radius: 10px;
    background: #fafbff;
  }

  .alert-badge {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }

  .alert-badge.warn {
    background: #F5A524;
    box-shadow: 0 0 0 4px rgba(245, 165, 36, 0.12);
  }

  .alert-badge.error {
    background: #EF5B4E;
    box-shadow: 0 0 0 4px rgba(239, 91, 78, 0.12);
  }

  .alert-badge.info {
    background: #3E7BFA;
    box-shadow: 0 0 0 4px rgba(62, 123, 250, 0.12);
  }

  .alert-title {
    font-size: 13px;
    font-weight: 600;
    color: #12213F;
  }

  .alert-meta {
    margin-top: 2px;
    font-size: 11.5px;
    color: #697086;
  }
`;

export default function AlertsPanel({ alerts = [] }) {
  const data = alerts.length
    ? alerts
    : [
        {
          id: 1,
          type: 'warn',
          title: '3 rides delayed due to weather conditions',
          meta: 'Route 08 · 14 mins ago',
        },
        {
          id: 2,
          type: 'error',
          title: '2 COD settlements require reconciliation',
          meta: 'Merchant desk · 22 mins ago',
        },
        {
          id: 3,
          type: 'info',
          title: 'New pickup scheduled for Kandy hub',
          meta: 'Operations team · 1 hour ago',
        },
      ];

  return (
    <div className="alerts-panel">
      <style>{styles}</style>

      <div className="panel-head">
        <div className="panel-title">Alerts & activity</div>
        <div className="link-sm">View all</div>
      </div>

      <div className="alert-list">
        {data.map((alert) => (
          <div key={alert.id} className="alert-item">
            <div className={`alert-badge ${alert.type}`} />
            <div>
              <div className="alert-title">{alert.title}</div>
              <div className="alert-meta">{alert.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
