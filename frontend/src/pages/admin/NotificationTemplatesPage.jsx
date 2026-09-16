import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';

export default function NotificationTemplatesPage() {
  const { notificationTemplates, notificationsOutbox, updateNotificationTemplate } = useStore();
  const [tab, setTab] = useState('templates');
  const [selectedId, setSelectedId] = useState(notificationTemplates[0]?.id || '');
  const [draft, setDraft] = useState(notificationTemplates[0]?.body || '');

  const selected = notificationTemplates.find((t) => t.id === selectedId) || notificationTemplates[0];

  const select = (template) => {
    setSelectedId(template.id);
    setDraft(template.body);
  };

  const handleSave = () => {
    updateNotificationTemplate(selected.id, draft);
    toast.success(`${selected.name} template saved`);
  };

  return (
    <PortalLayout>
      <style>{`.notification-template-layout{display:grid;grid-template-columns:280px minmax(0,1fr);gap:16px}@media(max-width:700px){.notification-template-layout{grid-template-columns:1fr}}`}</style>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Notifications</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Notification templates & outbox</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Automated SMS/Email messages and a log of everything that would have been sent.</div>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E3E7EF', marginBottom: 20 }}>
        {['templates', 'outbox'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{ padding: '10px 4px', marginRight: 22, fontSize: 13.5, fontWeight: 600, color: tab === key ? '#12213F' : '#9AA1B4', borderBottom: tab === key ? '2.5px solid #F5A524' : '2.5px solid transparent', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {key === 'templates' ? 'Templates' : `Outbox (${notificationsOutbox.length})`}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        <div className="notification-template-layout">
          <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
            {notificationTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => select(t)}
                style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${selected?.id === t.id ? '#F5A524' : '#E3E7EF'}`, background: '#fff', cursor: 'pointer' }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: '#12213F' }}>{t.name}</div>
                <div style={{ marginTop: 6 }}><StatusBadge status={t.channel} tone={t.channel === 'SMS' ? 'blue' : 'violet'} /></div>
              </button>
            ))}
          </div>

          {selected && (
            <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 22 }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 4 }}>{selected.name}</div>
              <div style={{ fontSize: 11.5, color: '#9AA1B4', marginBottom: 16 }}>Trigger: {selected.trigger} · Channel: {selected.channel}</div>

              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Message body</label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }}
              />
              <div style={{ fontSize: 11, color: '#9AA1B4', margin: '8px 0 16px' }}>
                Supported variables: {'{{customer_name}}'}, {'{{tracking_number}}'}, {'{{delivery_date}}'}, {'{{courier_name}}'}
              </div>
              <Button variant="accent" icon={Save} onClick={handleSave}>Save template</Button>
            </div>
          )}
        </div>
      )}

      {tab === 'outbox' && (
        <>
          <div style={{ fontSize: 12, color: '#9AA1B4', marginBottom: 12 }}>
            Every row here is a real, persisted record generated automatically as shipments move through their lifecycle. Each one also triggers a genuine delivery attempt through whichever SMS/Email/WhatsApp provider is configured via environment variables (see backend/services/notificationDispatcher.js) - "Not configured" means no real provider credentials exist yet, not that nothing was attempted.
          </div>
          <Table
            columns={[{ key: 'time', label: 'Time' }, { key: 'channel', label: 'Channel' }, { key: 'to', label: 'To' }, { key: 'template', label: 'Template' }, { key: 'external', label: 'External delivery' }]}
            data={notificationsOutbox}
            rowKey="id"
            emptyMessage="Nothing sent yet - create or update a shipment to generate outbox entries."
            renderRow={(n) => (
              <tr key={n.id}>
                <td style={{ whiteSpace: 'nowrap', color: '#9AA1B4' }}>{n.createdAt}</td>
                <td><StatusBadge status={n.channel} tone={n.channel === 'SMS' ? 'blue' : 'violet'} /></td>
                <td>{n.to}</td>
                <td>{n.templateName}</td>
                <td>
                  {n.externalDeliveryStatus ? (
                    <StatusBadge status={n.externalDeliveryStatus} tone={n.externalDeliveryStatus === 'Delivered' ? 'teal' : n.externalDeliveryStatus === 'Failed' ? 'coral' : 'amber'} />
                  ) : (
                    <span style={{ fontSize: 11, color: '#9AA1B4' }}>Pending attempt...</span>
                  )}
                  {n.externalDeliveryMissingEnvVars?.length ? (
                    <div style={{ fontSize: 10, color: '#9AA1B4', marginTop: 3 }}>Needs: {n.externalDeliveryMissingEnvVars.join(', ')}</div>
                  ) : null}
                </td>
              </tr>
            )}
          />
        </>
      )}
    </PortalLayout>
  );
}
