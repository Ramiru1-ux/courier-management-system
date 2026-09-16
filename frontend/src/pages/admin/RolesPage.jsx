import React from 'react';
import { BriefcaseBusiness, Plus } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import RoleForm from '../../components/admin/RoleForm';

const styles = `
  .roles-page {
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

  .stats-grid {
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

  .content-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 16px;
    align-items: start;
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

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    padding: 0 12px 10px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #9AA1B4;
  }

  td {
    padding: 13px 12px;
    border-top: 1px solid #E3E7EF;
    font-size: 13px;
    color: #12213F;
  }

  .role-name {
    font-weight: 700;
  }

  .muted {
    color: #697086;
    font-size: 11.5px;
    margin-top: 2px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 11px;
    font-weight: 700;
    background: #E8EFFE;
    color: #2453B8;
  }

  .chip::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .table-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .mini-btn {
    border: 1px solid #E3E7EF;
    border-radius: 8px;
    background: #fff;
    color: #12213F;
    font-size: 11px;
    font-weight: 700;
    padding: 6px 8px;
    cursor: pointer;
  }

  @media (max-width: 980px) {
    .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .content-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .roles-page { padding: 16px; }
    .page-head { flex-direction: column; align-items: flex-start; }
    .stats-grid { grid-template-columns: 1fr; }
  }
`;

const metrics = [
  { label: 'Role count', value: '12', delta: '3 new this quarter' },
  { label: 'Assigned users', value: '234', delta: '92% coverage' },
  { label: 'Custom roles', value: '04', delta: '2 active reviews' },
  { label: 'Pending requests', value: '11', delta: '2 needs approval' },
];

const roles = [
  { name: 'Operations Admin', department: 'Operations', users: 24, scope: 'Full access' },
  { name: 'Dispatch Manager', department: 'Operations', users: 18, scope: 'Dispatch + tracking' },
  { name: 'Finance Controller', department: 'Finance', users: 12, scope: 'COD + reconciliations' },
  { name: 'Support Lead', department: 'Customer care', users: 9, scope: 'Tickets + SLA' },
  { name: 'Driver Supervisor', department: 'Logistics', users: 14, scope: 'Driver routing' },
];

export default function RolesPage() {
  return (
    <PortalLayout>
      <div className="roles-page">
        <style>{styles}</style>

        <div className="page-head">
          <div>
            <p className="eyebrow">Administration</p>
            <h1 className="page-title">Roles and access</h1>
            <p className="page-subtitle">Define access levels and align permissions with operational responsibilities.</p>
          </div>

          <button type="button" className="primary-button">
            <Plus size={14} />
            Create role
          </button>
        </div>

        <div className="stats-grid">
          {metrics.map((metric) => (
            <div key={metric.label} className="metric-card">
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-delta">{metric.delta}</div>
            </div>
          ))}
        </div>

        <div className="content-grid">
          <div className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Active role catalog</h2>
              <div className="chip"><BriefcaseBusiness size={12} /> {roles.length} roles</div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Users</th>
                    <th>Access</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.name}>
                      <td>
                        <div className="role-name">{role.name}</div>
                        <div className="muted">Default role template</div>
                      </td>
                      <td>{role.department}</td>
                      <td>{role.users}</td>
                      <td>{role.scope}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="mini-btn">Edit</button>
                          <button type="button" className="mini-btn">Manage</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <RoleForm
            initialValues={{
              name: 'Operations Admin',
              department: 'Operations',
              description: 'Full access to dispatch planning, route oversight, assignment control, and operational monitoring.',
              groupAccess: ['Shipments', 'Tracking', 'Drivers', 'Finance'],
            }}
          />
        </div>
      </div>
    </PortalLayout>
  );
}
