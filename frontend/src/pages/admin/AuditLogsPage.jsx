import React, { useMemo, useState } from 'react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import useStore from '../../hooks/useStore';

export default function AuditLogsPage() {
  const { auditLogs } = useStore();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return auditLogs;
    return auditLogs.filter((log) => [log.user, log.action, log.detail].join(' ').toLowerCase().includes(term));
  }, [auditLogs, query]);

  const columns = [
    { key: 'timestamp', label: 'Time' },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'detail', label: 'Detail' },
  ];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Audit logs</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Audit trail</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Every sensitive action taken across the system, most recent first.</div>
      </div>

      <div style={{ maxWidth: 380, marginBottom: 16 }}>
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by user, action or detail..." />
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey="id"
        emptyMessage="No audit records match your search."
        renderRow={(log) => (
          <tr key={log.id}>
            <td style={{ whiteSpace: 'nowrap', color: '#9AA1B4' }}>{log.timestamp}</td>
            <td>{log.user}</td>
            <td style={{ fontWeight: 600 }}>{log.action}</td>
            <td style={{ color: '#697086' }}>{log.detail}</td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}
