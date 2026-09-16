import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';

const TICKET_STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'];
const COMPLAINT_STATUSES = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];

function nextStatus(current, sequence) {
  const index = sequence.indexOf(current);
  return sequence[Math.min(index + 1, sequence.length - 1)];
}

function Stars({ count }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={13} fill={n <= count ? '#F5A524' : 'none'} color={n <= count ? '#F5A524' : '#CBD3E2'} />)}
    </span>
  );
}

export default function SupportPage() {
  const { supportTickets, complaints, ratings, drivers, setTicketStatus, setComplaintStatus } = useStore();
  const [tab, setTab] = useState('tickets');

  const driverAverages = useMemo(() => {
    const byDriver = {};
    ratings.forEach((r) => {
      byDriver[r.driverId] = byDriver[r.driverId] || [];
      byDriver[r.driverId].push(r.stars);
    });
    return Object.entries(byDriver).map(([driverId, stars]) => ({
      driverId,
      driverName: drivers.find((d) => d.id === driverId)?.name || driverId,
      average: stars.reduce((a, b) => a + b, 0) / stars.length,
      count: stars.length,
    }));
  }, [ratings, drivers]);

  const advanceTicket = (ticket) => {
    const next = nextStatus(ticket.status, TICKET_STATUSES);
    setTicketStatus(ticket.id, next);
    toast.success(`${ticket.id} -> ${next.replace(/_/g, ' ')}`);
  };

  const advanceComplaint = (complaint) => {
    const next = nextStatus(complaint.status, COMPLAINT_STATUSES);
    setComplaintStatus(complaint.id, next);
    toast.success(`${complaint.id} -> ${next}`);
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Support & complaints</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Customer support & complaints</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Track support tickets and formal complaints tied to shipments.</div>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E3E7EF', marginBottom: 20 }}>
        {['tickets', 'complaints', 'ratings'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{ padding: '10px 4px', marginRight: 22, fontSize: 13.5, fontWeight: 600, color: tab === key ? '#12213F' : '#9AA1B4', borderBottom: tab === key ? '2.5px solid #F5A524' : '2.5px solid transparent', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {key === 'tickets' ? `Support tickets (${supportTickets.length})` : key === 'complaints' ? `Complaints (${complaints.length})` : `Ratings (${ratings.length})`}
          </button>
        ))}
      </div>

      {tab === 'tickets' && (
        <Table
          columns={[{ key: 'id', label: 'Ticket' }, { key: 'customer', label: 'Customer' }, { key: 'category', label: 'Category' }, { key: 'priority', label: 'Priority' }, { key: 'status', label: 'Status' }, { key: 'actions', label: '' }]}
          data={supportTickets}
          rowKey="id"
          emptyMessage="No support tickets."
          renderRow={(t) => (
            <tr key={t.id}>
              <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{t.id}</td>
              <td>{t.customer}<div style={{ fontSize: 11, color: '#9AA1B4' }}>{t.reference}</div></td>
              <td>{t.category}</td>
              <td><StatusBadge status={t.priority} tone={t.priority === 'High' ? 'coral' : t.priority === 'Medium' ? 'amber' : 'neutral'} /></td>
              <td><StatusBadge status={t.status.replace(/_/g, ' ')} tone={t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'teal' : t.status === 'OPEN' ? 'coral' : 'amber'} /></td>
              <td style={{ textAlign: 'right' }}>
                {t.status !== 'CLOSED' && <Button size="small" variant="secondary" onClick={() => advanceTicket(t)}>Advance</Button>}
              </td>
            </tr>
          )}
        />
      )}

      {tab === 'complaints' && (
        <Table
          columns={[{ key: 'id', label: 'Complaint' }, { key: 'customer', label: 'Customer' }, { key: 'category', label: 'Category' }, { key: 'description', label: 'Description' }, { key: 'status', label: 'Status' }, { key: 'actions', label: '' }]}
          data={complaints}
          rowKey="id"
          emptyMessage="No complaints logged."
          renderRow={(c) => (
            <tr key={c.id}>
              <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{c.id}</td>
              <td>{c.customer}<div style={{ fontSize: 11, color: '#9AA1B4' }}>{c.reference}</div></td>
              <td>{c.category}</td>
              <td style={{ color: '#697086', fontSize: 12, maxWidth: 260 }}>{c.description}</td>
              <td><StatusBadge status={c.status} tone={c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'teal' : c.status === 'OPEN' ? 'coral' : 'amber'} /></td>
              <td style={{ textAlign: 'right' }}>
                {c.status !== 'CLOSED' && <Button size="small" variant="secondary" onClick={() => advanceComplaint(c)}>Advance</Button>}
              </td>
            </tr>
          )}
        />
      )}

      {tab === 'ratings' && (
        <>
          {driverAverages.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              {driverAverages.map((d) => (
                <div key={d.driverId} style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 12, padding: '12px 16px', minWidth: 180 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#12213F' }}>{d.driverName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <Stars count={Math.round(d.average)} />
                    <span style={{ fontSize: 11.5, color: '#697086' }}>{d.average.toFixed(1)} ({d.count})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Table
            columns={[{ key: 'shipment', label: 'Shipment' }, { key: 'driver', label: 'Driver' }, { key: 'stars', label: 'Rating' }, { key: 'comment', label: 'Comment' }, { key: 'date', label: 'Date' }]}
            data={ratings}
            rowKey="id"
            emptyMessage="No ratings submitted yet."
            renderRow={(r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{r.shipmentId}</td>
                <td>{drivers.find((d) => d.id === r.driverId)?.name || r.driverId}</td>
                <td><Stars count={r.stars} /></td>
                <td style={{ color: '#697086', fontSize: 12, maxWidth: 260 }}>{r.comment}</td>
                <td style={{ color: '#9AA1B4', fontSize: 11.5 }}>{r.createdAt}</td>
              </tr>
            )}
          />
        </>
      )}
    </PortalLayout>
  );
}
