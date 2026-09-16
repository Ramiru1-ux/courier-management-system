import React from 'react';
import { LockKeyhole, Plus } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import PermissionMatrix from '../../components/admin/PermissionMatrix';

const styles = `
  .permissions-page {
    display: grid;
    gap: 20px;
    padding: 24px;
  }

  .page-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .eyebrow {
    margin: 0 0 5px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9AA1B4;
  }

  .page-title {
    margin: 0;
    color: #12213F;
    font-family: 'Sora', sans-serif;
    font-size: 22px;
    font-weight: 700;
  }

  .page-subtitle {
    margin: 8px 0 0;
    color: #697086;
    font-size: 13px;
  }

  .primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #12213F;
    color: #fff;
    border: 1px solid #12213F;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .metric-card {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 17px 18px;
  }

  .metric-label {
    font-size: 12px;
    color: #697086;
    font-weight: 600;
  }

  .metric-value {
    margin-top: 10px;
    color: #12213F;
    font-family: 'Sora', sans-serif;
    font-size: 26px;
    font-weight: 800;
  }

  .metric-delta {
    margin-top: 5px;
    color: #0C8C6B;
    font-size: 11.5px;
    font-weight: 600;
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
    margin-bottom: 14px;
  }

  .panel-title {
    margin: 0;
    color: #12213F;
    font-family: 'Sora', sans-serif;
    font-size: 14.5px;
    font-weight: 700;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 999px;
    background: #E4F7F4;
    color: #0C8C6B;
    font-size: 11px;
    font-weight: 700;
  }

  @media (max-width: 980px) {
    .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 640px) {
    .permissions-page { padding: 16px; }
    .page-head { flex-direction: column; align-items: flex-start; }
    .summary-grid { grid-template-columns: 1fr; }
  }
`;

const stats = [
  { label: 'Permission sets', value: '36', delta: 'All modules covered' },
  { label: 'Admin rights', value: '14', delta: '2 under review' },
  { label: 'Custom access', value: '09', delta: '3 high sensitivity' },
  { label: 'Open audits', value: '04', delta: '1 needs sign-off' },
];

export default function PermissionsPage() {
  return (
    <PortalLayout>
      <div className="permissions-page">
        <style>{styles}</style>

        <div className="page-head">
          <div>
            <p className="eyebrow">Administration</p>
            <h1 className="page-title">Permission matrix</h1>
            <p className="page-subtitle">Review module-level authority and maintain least-privilege access for every administrative role.</p>
          </div>

          <button type="button" className="primary-button">
            <Plus size={14} />
            Add rule
          </button>
        </div>

        <div className="summary-grid">
          {stats.map((item) => (
            <div key={item.label} className="metric-card">
              <div className="metric-label">{item.label}</div>
              <div className="metric-value">{item.value}</div>
              <div className="metric-delta">{item.delta}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Access controls by module</h2>
            <span className="chip"><LockKeyhole size={12} /> policy synced</span>
          </div>

          <PermissionMatrix />
        </div>
      </div>
    </PortalLayout>
  );
}
