import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

const emptyRule = { label: '', minWeight: '', maxWeight: '', price: '', serviceType: 'Standard' };
const emptyZone = { name: '', province: '', serviceability: 'SERVICEABLE' };

export default function PricingZonesPage() {
  const { pricingRules, zones, addPricingRule, addZone, toggleZoneStatus } = useStore();
  const [tab, setTab] = useState('pricing');
  const [ruleOpen, setRuleOpen] = useState(false);
  const [zoneOpen, setZoneOpen] = useState(false);
  const [rule, setRule] = useState(emptyRule);
  const [zone, setZone] = useState(emptyZone);
  const [checkCity, setCheckCity] = useState('');
  const [checkResult, setCheckResult] = useState(null);

  const handleAddRule = (event) => {
    event.preventDefault();
    if (!rule.label || !rule.price) return;
    addPricingRule({ ...rule, minWeight: Number(rule.minWeight) || 0, maxWeight: Number(rule.maxWeight) || 0, price: Number(rule.price) });
    toast.success('Pricing rule added');
    setRule(emptyRule);
    setRuleOpen(false);
  };

  const handleAddZone = (event) => {
    event.preventDefault();
    if (!zone.name) return;
    addZone(zone);
    toast.success(`Zone ${zone.name} added`);
    setZone(emptyZone);
    setZoneOpen(false);
  };

  const handleCheck = (event) => {
    event.preventDefault();
    const term = checkCity.trim().toLowerCase();
    const match = zones.find((z) => z.name.toLowerCase().includes(term) || z.province.toLowerCase().includes(term));
    setCheckResult(match ? match.serviceability : 'NOT SERVICEABLE');
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Pricing & zones</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Pricing, zones & serviceability</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Tariff rules by weight/service and delivery-zone coverage.</div>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E3E7EF', marginBottom: 20 }}>
        {['pricing', 'zones', 'serviceability'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{ padding: '10px 4px', marginRight: 22, fontSize: 13.5, fontWeight: 600, color: tab === key ? '#12213F' : '#9AA1B4', borderBottom: tab === key ? '2.5px solid #F5A524' : '2.5px solid transparent', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {key === 'pricing' ? 'Pricing rules' : key === 'zones' ? 'Delivery zones' : 'Serviceability check'}
          </button>
        ))}
      </div>

      {tab === 'pricing' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button variant="accent" icon={Plus} onClick={() => setRuleOpen(true)}>Add rule</Button>
          </div>
          <Table
            columns={[{ key: 'weight', label: 'Weight range' }, { key: 'service', label: 'Service type' }, { key: 'price', label: 'Price' }]}
            data={pricingRules}
            rowKey="id"
            emptyMessage="No pricing rules yet."
            renderRow={(r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                <td>{r.serviceType}</td>
                <td style={{ fontWeight: 700 }}>{formatLKR(r.price)}</td>
              </tr>
            )}
          />
        </>
      )}

      {tab === 'zones' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button variant="accent" icon={Plus} onClick={() => setZoneOpen(true)}>Add zone</Button>
          </div>
          <Table
            columns={[{ key: 'name', label: 'Zone' }, { key: 'province', label: 'Province' }, { key: 'service', label: 'Serviceability' }, { key: 'status', label: 'Status' }, { key: 'actions', label: '' }]}
            data={zones}
            rowKey="id"
            emptyMessage="No zones configured."
            renderRow={(z) => (
              <tr key={z.id}>
                <td style={{ fontWeight: 600 }}>{z.name}</td>
                <td>{z.province}</td>
                <td><StatusBadge status={z.serviceability} tone={z.serviceability === 'SERVICEABLE' ? 'teal' : z.serviceability === 'LIMITED SERVICE' ? 'amber' : 'coral'} /></td>
                <td><StatusBadge status={z.status} tone={z.status === 'Active' ? 'teal' : 'neutral'} /></td>
                <td style={{ textAlign: 'right' }}>
                  <Button size="small" variant="secondary" onClick={() => toggleZoneStatus(z.id)}>{z.status === 'Active' ? 'Deactivate' : 'Activate'}</Button>
                </td>
              </tr>
            )}
          />
        </>
      )}

      {tab === 'serviceability' && (
        <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 24, maxWidth: 480 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#12213F', marginBottom: 10 }}>Check destination serviceability</div>
          <form onSubmit={handleCheck} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input value={checkCity} onChange={(e) => setCheckCity(e.target.value)} placeholder="City or province, e.g. Jaffna" style={{ flex: 1, border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
            <Button type="submit" variant="primary" icon={Search}>Check</Button>
          </form>
          {checkResult && (
            <div>
              <span style={{ fontSize: 12.5, color: '#697086', marginRight: 8 }}>Result:</span>
              <StatusBadge status={checkResult} tone={checkResult === 'SERVICEABLE' ? 'teal' : checkResult === 'LIMITED SERVICE' ? 'amber' : 'coral'} showIcon />
            </div>
          )}
        </div>
      )}

      <Modal open={ruleOpen} onClose={() => setRuleOpen(false)} title="Add pricing rule" footer={<><Button variant="secondary" onClick={() => setRuleOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleAddRule}>Add rule</Button></>}>
        <form onSubmit={handleAddRule} style={{ display: 'grid', gap: 12 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Label</label><input value={rule.label} onChange={(e) => setRule((p) => ({ ...p, label: e.target.value }))} placeholder="10 - 20 kg" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Min weight (kg)</label><input type="number" value={rule.minWeight} onChange={(e) => setRule((p) => ({ ...p, minWeight: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Max weight (kg)</label><input type="number" value={rule.maxWeight} onChange={(e) => setRule((p) => ({ ...p, maxWeight: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Service type</label>
            <select value={rule.serviceType} onChange={(e) => setRule((p) => ({ ...p, serviceType: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              <option>Standard</option>
              <option>Express</option>
              <option>Priority</option>
              <option>Same-Day</option>
            </select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Price (Rs)</label><input type="number" value={rule.price} onChange={(e) => setRule((p) => ({ ...p, price: e.target.value }))} placeholder="1200" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
        </form>
      </Modal>

      <Modal open={zoneOpen} onClose={() => setZoneOpen(false)} title="Add zone" footer={<><Button variant="secondary" onClick={() => setZoneOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleAddZone}>Add zone</Button></>}>
        <form onSubmit={handleAddZone} style={{ display: 'grid', gap: 12 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Zone name</label><input value={zone.name} onChange={(e) => setZone((p) => ({ ...p, name: e.target.value }))} placeholder="Zone G - Batticaloa" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Province</label><input value={zone.province} onChange={(e) => setZone((p) => ({ ...p, province: e.target.value }))} placeholder="Eastern" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>Serviceability</label>
            <select value={zone.serviceability} onChange={(e) => setZone((p) => ({ ...p, serviceability: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              <option>SERVICEABLE</option>
              <option>LIMITED SERVICE</option>
              <option>PICKUP ONLY</option>
              <option>NOT SERVICEABLE</option>
            </select>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
