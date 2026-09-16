import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import useAuth from '../../hooks/useAuth';
import useStore from '../../hooks/useStore';

const emptyForm = { label: '', address: '', city: '', contact: '', phone: '' };

export default function MerchantAddressesPage() {
  const { user } = useAuth();
  const { addresses: savedAddresses, storeStatus, addAddress, removeAddress } = useStore();
  const merchantName = user?.merchantName || 'Urban Mart';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const addresses = (savedAddresses || []).filter((address) => address.merchant === merchantName);

  useEffect(() => {
    if (storeStatus !== 'ready' || addresses.length) return;
    try {
      const key = `cms_merchant_addresses_${merchantName}`;
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (saved.length) {
        saved.forEach(({ id, ...address }) => addAddress(merchantName, address));
      } else {
        addAddress(merchantName, {
          label: 'Main warehouse',
          address: 'No. 5, Union Place',
          city: 'Colombo 2',
          contact: 'Store Manager',
          phone: '011 234 5566',
        });
      }
      if (saved.length) localStorage.removeItem(key);
    } catch (error) {
      // Ignore malformed legacy browser data; MongoDB remains the source of truth.
    }
  }, [addAddress, addresses.length, merchantName, storeStatus]);

  const handleAdd = (event) => {
    event.preventDefault();
    if (!form.label || !form.address) return;
    addAddress(merchantName, form);
    toast.success('Address saved');
    setForm(emptyForm);
    setOpen(false);
  };

  const handleRemove = (id) => {
    removeAddress(id);
    toast.success('Address removed');
  };

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>Addresses</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Saved addresses</h1>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>Add address</Button>
      </div>

      <Table
        columns={[{ key: 'label', label: 'Label' }, { key: 'address', label: 'Address' }, { key: 'contact', label: 'Contact' }, { key: 'actions', label: '' }]}
        data={addresses}
        rowKey="id"
        emptyMessage="No saved addresses yet."
        renderRow={(a) => (
          <tr key={a.id}>
            <td style={{ fontWeight: 600 }}>{a.label}</td>
            <td>{a.address}, {a.city}</td>
            <td>{a.contact}<div style={{ fontSize: 11, color: '#9AA1B4' }}>{a.phone}</div></td>
            <td style={{ textAlign: 'right' }}><Button size="small" variant="danger" icon={Trash2} onClick={() => handleRemove(a.id)} /></td>
          </tr>
        )}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add address" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleAdd}>Save</Button></>}>
        <form onSubmit={handleAdd} style={{ display: 'grid', gap: 12 }}>
          {[['label', 'Label', 'Warehouse 2'], ['address', 'Address', 'No. 12, Main Street'], ['city', 'City', 'Colombo 5'], ['contact', 'Contact person', 'Full name'], ['phone', 'Phone', '011 555 1234']].map(([name, label, placeholder]) => (
            <div key={name}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>{label}</label>
              <input value={form[name]} onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))} placeholder={placeholder} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
            </div>
          ))}
        </form>
      </Modal>
    </PortalLayout>
  );
}
