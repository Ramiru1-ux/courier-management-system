import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useStore from '../../hooks/useStore';

export default function SystemSettingsPage() {
  const { resetDemoData } = useStore();
  const [form, setForm] = useState({
    organizationName: 'EgoTECHWORLD Logistics',
    timezone: 'Asia/Colombo (IST)',
    defaultSla: 'Next day delivery',
    codCadence: 'Daily',
  });
  const [confirmReset, setConfirmReset] = useState(false);

  const update = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSave = (event) => {
    event.preventDefault();
    toast.success('Settings saved');
  };

  const handleReset = () => {
    resetDemoData();
    toast.success('Demo data has been reset');
    setConfirmReset(false);
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Settings</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>System configuration</h1>
      </div>

      <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 26, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Organization name</label>
            <input value={form.organizationName} onChange={(e) => update('organizationName', e.target.value)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Default timezone</label>
            <select value={form.timezone} onChange={(e) => update('timezone', e.target.value)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              <option>Asia/Colombo (IST)</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Default service SLA</label>
            <input value={form.defaultSla} onChange={(e) => update('defaultSla', e.target.value)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>COD settlement cadence</label>
            <select value={form.codCadence} onChange={(e) => update('codCadence', e.target.value)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
        </div>
        <Button type="submit" variant="accent">Save settings</Button>
      </form>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 22 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 6 }}>Demo data</div>
        <p style={{ fontSize: 12.5, color: '#697086', margin: '0 0 14px' }}>Restore shipments, drivers, users and finance records to their original demo state. This clears anything created during this session.</p>
        <Button variant="secondary" icon={RotateCcw} onClick={() => setConfirmReset(true)}>Reset demo data</Button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data"
        message="This restores all shipments, users, branches and finance records to their starting state. Continue?"
        confirmLabel="Reset data"
        danger
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </PortalLayout>
  );
}
