import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { getNameError, getAddressError, filterNameInput, filterAddressInput } from '../../utils/textValidation';

const emptyForm = { name: '', city: '', manager: '', phone: '' };

export default function BranchesPage() {
  const { branches, drivers, addBranch, toggleBranchStatus } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const driversAt = (branchName) => drivers.filter((d) => d.branch === branchName).length;

  const handleCreate = (event) => {
    event.preventDefault();
    if (!form.name || !form.city) return;
    // The manager is a person, so letters only; a branch name and a city
    // legitimately carry digits ("Colombo 07"), so those only refuse the
    // symbols that never belong in one. See utils/textValidation.js.
    const fieldError = getAddressError(form.name, 'Branch name')
      || getAddressError(form.city, 'City')
      || getNameError(form.manager, 'Branch manager', { required: false });
    if (fieldError) {
      toast.error(fieldError);
      return;
    }
    addBranch(form);
    toast.success(`Branch ${form.name} added`);
    setForm(emptyForm);
    setOpen(false);
  };

  const handleToggle = (branch) => {
    toggleBranchStatus(branch.id);
    toast.success(`${branch.name} is now ${branch.status === 'Active' ? 'inactive' : 'active'}`);
  };

  const columns = [
    { key: 'name', label: 'Branch' },
    { key: 'manager', label: 'Manager' },
    { key: 'phone', label: 'Contact' },
    { key: 'drivers', label: 'Drivers' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Branches</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Branch management</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{branches.length} operational locations.</div>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>Add branch</Button>
      </div>

      <Table
        columns={columns}
        data={branches}
        rowKey="id"
        emptyMessage="No branches yet."
        renderRow={(branch) => (
          <tr key={branch.id}>
            <td>
              <div style={{ fontWeight: 600, color: '#12213F' }}>{branch.name}</div>
              <div style={{ fontSize: 11, color: '#9AA1B4' }}>{branch.city}</div>
            </td>
            <td>{branch.manager}</td>
            <td>{branch.phone}</td>
            <td>{driversAt(branch.name)}</td>
            <td><StatusBadge status={branch.status} tone={branch.status === 'Active' ? 'teal' : 'neutral'} /></td>
            <td style={{ textAlign: 'right' }}>
              <Button size="small" variant="secondary" onClick={() => handleToggle(branch)}>{branch.status === 'Active' ? 'Deactivate' : 'Activate'}</Button>
            </td>
          </tr>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add branch"
        description="Register a new branch or hub location."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleCreate}>Create branch</Button></>}
      >
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
          {[
            ['name', 'Branch name', 'Kurunegala Hub'],
            ['city', 'City', 'Kurunegala'],
            ['manager', 'Branch manager', 'Full name'],
            ['phone', 'Contact number', '037 222 1190'],
          ].map(([name, label, placeholder]) => (
            <div key={name}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>{label}</label>
              <input value={form[name]} onChange={(e) => setForm((p) => ({ ...p, [name]: name === 'manager' ? filterNameInput(e.target.value) : name === 'phone' ? e.target.value : filterAddressInput(e.target.value) }))} placeholder={placeholder} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
            </div>
          ))}
        </form>
      </Modal>
    </PortalLayout>
  );
}
