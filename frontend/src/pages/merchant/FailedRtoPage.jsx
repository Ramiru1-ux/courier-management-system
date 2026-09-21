import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import { getFailedRtoShipments } from '../../api/appDataApi';
import {
  statusLabel, statusTone, failureReasonLabel, formatLKR, formatDateTime, needsAttention, isRto,
} from '../../utils/shipmentStatus';

/**
 * The merchant's failed and returned shipments.
 *
 * Read straight from MongoDB through GET /api/app-data/shipments/failed-rto,
 * which filters by the merchant named in the caller's own token - so this
 * page cannot show another merchant's parcels even if it tried, and the
 * counts describe the database rather than whatever rows happen to be loaded
 * in the browser.
 */
export default function FailedRtoPage() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ needsAttention: 0, rtoCompleted: 0 });
  const [state, setState] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const response = await getFailedRtoShipments();
      setRows(response?.data || []);
      setCounts({
        needsAttention: response?.needsAttention || 0,
        rtoCompleted: response?.rtoCompleted || 0,
      });
      setState('ready');
    } catch (requestError) {
      setError(requestError?.message || 'Could not load your failed and returned shipments.');
      setState('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const term = query.trim().toLowerCase();
  const visible = rows
    .filter((s) => (showCompleted ? true : needsAttention(s.status)))
    .filter((s) => !term || [s.trackingNumber, s.recipientName, s.recipientCity, s.failureReason]
      .join(' ').toLowerCase().includes(term));

  const columns = [
    { key: 'tracking', label: 'Tracking' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'status', label: 'Status' },
    { key: 'reason', label: 'Failure reason' },
    { key: 'updated', label: 'Last updated' },
    { key: 'cod', label: 'COD' },
  ];

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>Failed &amp; RTO</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Failed &amp; returned shipments</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>
            {state === 'ready'
              ? `${counts.needsAttention} need attention · ${counts.rtoCompleted} returned and closed.`
              : 'Loading from the database…'}
          </div>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={load} loading={state === 'loading'}>Refresh</Button>
      </div>

      {state === 'error' && (
        <div style={{ padding: '12px 15px', borderRadius: 10, background: '#FDE9E7', color: '#B23528', fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracking, recipient or reason..." />
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#697086', fontWeight: 600 }}>
          <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
          Include completed returns
        </label>
      </div>

      {state === 'ready' && visible.length === 0 ? (
        <EmptyState
          title="Nothing needs attention"
          description="None of your shipments have failed delivery or been returned."
        />
      ) : (
        <Table
          columns={columns}
          data={visible}
          rowKey="id"
          emptyMessage={state === 'loading' ? 'Loading…' : 'No shipments match your search.'}
          renderRow={(s) => (
            <tr key={s.id}>
              <td>
                <Link to={`/shipments/${s.id}`} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: '#12213F', fontSize: 12.5 }}>
                  {s.trackingNumber}
                </Link>
                <div style={{ fontSize: 11, color: '#9AA1B4', marginTop: 2 }}>{s.serviceType} · {s.weight} kg</div>
              </td>
              <td>
                <div>{s.recipientName}</div>
                <div style={{ fontSize: 11, color: '#9AA1B4' }}>{s.recipientCity}</div>
              </td>
              <td>
                <StatusBadge status={statusLabel(s.status)} tone={statusTone(s.status)} />
                {isRto(s.status) && s.rtoReason ? (
                  <div style={{ fontSize: 11, color: '#9AA1B4', marginTop: 3 }}>{s.rtoReason}</div>
                ) : null}
              </td>
              <td style={{ fontSize: 12.5, color: '#697086' }}>
                {s.failureReason ? failureReasonLabel(s.failureReason) : '—'}
                {s.deliveryAttempts ? (
                  <div style={{ fontSize: 11, color: '#9AA1B4' }}>{s.deliveryAttempts} attempt(s)</div>
                ) : null}
              </td>
              <td style={{ fontSize: 12.5, color: '#697086' }}>
                {formatDateTime(s.rtoCompletedAt || s.rtoInitiatedAt || s.failedAt || s.createdAt)}
              </td>
              <td>{s.codAmount ? formatLKR(s.codAmount) : '—'}</td>
            </tr>
          )}
        />
      )}
    </PortalLayout>
  );
}
