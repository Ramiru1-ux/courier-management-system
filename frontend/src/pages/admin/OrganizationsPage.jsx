import React from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';

export default function OrganizationsPage() {
  const { organizations } = useStore();

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Organizations</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Organizations</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Every courier company using this platform, if run as multi-tenant SaaS.</div>
      </div>

      <Table
        columns={[{ key: 'name', label: 'Organization' }, { key: 'plan', label: 'Plan' }, { key: 'branches', label: 'Branches' }, { key: 'drivers', label: 'Drivers' }, { key: 'status', label: 'Status' }]}
        data={organizations}
        rowKey="id"
        emptyMessage="No organizations yet."
        renderRow={(o) => (
          <tr key={o.id}>
            <td style={{ fontWeight: 600 }}>{o.name}</td>
            <td>{o.plan}</td>
            <td>{o.branches}</td>
            <td>{o.drivers}</td>
            <td><StatusBadge status={o.status} tone={o.status === 'Active' ? 'teal' : 'amber'} /></td>
          </tr>
        )}
      />

      <div style={{ marginTop: 14, fontSize: 12, color: '#9AA1B4' }}>
        Manage plans from <Link to="/admin/subscriptions" style={{ color: '#3E7BFA', fontWeight: 600 }}>Subscriptions</Link>.
      </div>
    </PortalLayout>
  );
}
