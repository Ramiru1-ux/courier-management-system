import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Ban, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useStore from '../../hooks/useStore';
import authApi from '../../api/authApi';
import { getEmailError } from '../../utils/emailValidation';

const emptyForm = { name: '', email: '', phone: '', branch: '', vehicle: '', vehicleType: 'Motorbike', vehicleModel: '', vehicleCapacity: '', insuranceExpiry: '', password: '' };

export default function DriversPage() {
  const { drivers, branches, addDriver, setDriverAccountStatus, removeDriver } = useStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingAction, setPendingAction] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return drivers;
    return drivers.filter((driver) => [driver.id, driver.name, driver.email, driver.phone, driver.branch, driver.vehicle, driver.status].join(' ').toLowerCase().includes(term));
  }, [drivers, query]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleCreate = async (event) => {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!form.name.trim() || !email || !form.password || form.password.length < 8) {
      toast.error('Enter all required fields and a password with at least 8 characters.');
      return;
    }
    const emailError = getEmailError(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }
    if (drivers.some((driver) => driver.email?.toLowerCase() === email)) {
      toast.error('A driver account already uses that email.');
      return;
    }
    if (form.vehicle && drivers.some((driver) => driver.vehicle?.toLowerCase() === form.vehicle.trim().toLowerCase())) {
      toast.error('A driver already uses that vehicle registration.');
      return;
    }
    const { password, ...details } = form;
    const branch = form.branch || branches[0]?.name || '';
    // Generated here (not left to addDriver's internal nextId) so the exact
    // same id can be stamped onto the real login account below - that link
    // is what lets the backend scope "my deliveries" correctly for this
    // driver (see backend/utils/roleScope.js resolveDriverBlobId). Without
    // it, a driver created through this form would have an empty
    // User.driverId and fall back to seeing another driver's deliveries.
    const driverId = `DRV-${Date.now().toString(36)}`;

    // Create the real driver-portal login in MongoDB first. If that fails
    // (duplicate email, server unreachable) the driver row is not added
    // either, so the list never shows someone who cannot sign in.
    try {
      await authApi.register({ name: form.name.trim(), email, password, role: 'driver', phone: form.phone, branch, driverId });
    } catch (error) {
      toast.error(error?.message || 'Could not create the driver login.');
      return;
    }

    // The real, login-capable password lives only in MongoDB's users
    // collection (bcrypt-hashed, written above by authApi.register). This
    // list is just a display row for the UI, so it never stores any form
    // of the password or a hash derived from it.
    addDriver({ ...details, id: driverId, name: form.name.trim(), email, branch });
    toast.success(`${form.name} added. They can now sign in to the driver portal.`);
    setForm(emptyForm);
    setOpen(false);
  };

    const confirmAction = async () => {
    if (!pendingAction || busy) return;

    if (pendingAction.action === 'delete') {
      const { driver } = pendingAction;
      setBusy(true);
      try {
        // Remove the driver-portal login from MongoDB first so the email can
        // be used again; only then remove the driver row from the list.
        if (driver.email) await authApi.deleteUserByEmail(driver.email);
        removeDriver(driver.id);
        toast.success(`${driver.name} deleted`);
        setPendingAction(null);
      } catch (error) {
        toast.error(error?.message || 'Could not delete the driver login.');
      } finally {
        setBusy(false);
      }
      return;
    }

    const nextStatus = pendingAction.driver.accountStatus === 'Suspended' ? 'Active' : 'Suspended';
    setDriverAccountStatus(pendingAction.driver.id, nextStatus);
    toast.success(`${pendingAction.driver.name} portal access ${nextStatus === 'Active' ? 'restored' : 'deactivated'}`);
    setPendingAction(null);
  };

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Drivers</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Driver management</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{drivers.length} driver accounts across all branches.</div>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>Add driver</Button>
      </div>

      <div style={{ maxWidth: 400, marginBottom: 16 }}><SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search drivers..." /></div>

      <Table
        columns={[{ key: 'driver', label: 'Driver' }, { key: 'contact', label: 'Contact' }, { key: 'branch', label: 'Branch' }, { key: 'vehicle', label: 'Vehicle' }, { key: 'status', label: 'Availability' }, { key: 'account', label: 'Portal access' }, { key: 'actions', label: '' }]}
        data={filtered}
        rowKey="id"
        emptyMessage="No drivers match your search."
        renderRow={(driver) => (
          <tr key={driver.id}>
            <td><div style={{ fontWeight: 700, color: '#12213F' }}>{driver.name}</div><div style={{ fontSize: 11, color: '#9AA1B4' }}>{driver.id}</div></td>
            <td><div>{driver.email}</div><div style={{ fontSize: 11, color: '#9AA1B4' }}>{driver.phone || 'No phone added'}</div></td>
            <td>{driver.branch || 'Unassigned'}</td>
            <td>{driver.vehicle || 'Unassigned'}</td>
            <td><StatusBadge status={driver.status} tone={driver.status === 'Available' ? 'teal' : driver.status === 'Delivering' ? 'amber' : 'neutral'} /></td>
            <td><StatusBadge status={driver.accountStatus || 'Active'} tone={(driver.accountStatus || 'Active') === 'Active' ? 'teal' : 'coral'} /></td>
            <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button size="small" variant="secondary" icon={(driver.accountStatus || 'Active') === 'Active' ? Ban : CheckCircle2} onClick={() => setPendingAction({ driver, action: 'status' })}>
                {(driver.accountStatus || 'Active') === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button size="small" variant="danger" icon={Trash2} aria-label={`Delete ${driver.name}`} onClick={() => setPendingAction({ driver, action: 'delete' })} />
            </td>
          </tr>
        )}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add driver" description="Create a driver profile and portal login credentials." footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" type="submit" form="driver-form">Create driver</Button></>}>
        <form id="driver-form" onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
          {[['name', 'Full name', 'Kasun Jayawardena', 'text'], ['email', 'Email address', 'driver@egotechworld.com', 'email'], ['phone', 'Phone number', '077 112 3344', 'tel'], ['vehicle', 'Vehicle registration', 'LK-6612', 'text'], ['vehicleModel', 'Vehicle model', 'Honda Dio', 'text'], ['vehicleCapacity', 'Vehicle capacity', '20 kg', 'text']].map(([name, label, placeholder, type]) => (
            <div key={name}><label htmlFor={`driver-${name}`} style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#697086' }}>{label}</label><input id={`driver-${name}`} name={name} type={type} value={form[name]} onChange={update} placeholder={placeholder} required={name === 'name' || name === 'email'} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          ))}
          <div><label htmlFor="driver-vehicleType" style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#697086' }}>Vehicle type</label><select id="driver-vehicleType" name="vehicleType" value={form.vehicleType} onChange={update} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}><option>Motorbike</option><option>Three-wheeler</option><option>Van</option><option>Truck</option></select></div>
          <div><label htmlFor="driver-insuranceExpiry" style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#697086' }}>Insurance expiry</label><input id="driver-insuranceExpiry" name="insuranceExpiry" type="date" value={form.insuranceExpiry} onChange={update} required={Boolean(form.vehicle)} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /></div>
          <div><label htmlFor="driver-branch" style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#697086' }}>Branch</label><select id="driver-branch" name="branch" value={form.branch} onChange={update} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}><option value="">Select branch</option>{branches.map((branch) => <option key={branch.id} value={branch.name}>{branch.name}</option>)}</select></div>
          <div><label htmlFor="driver-password" style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: '#697086' }}>Portal password</label><input id="driver-password" name="password" type="password" value={form.password} onChange={update} minLength={8} placeholder="At least 8 characters" required style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} /><div style={{ marginTop: 5, fontSize: 11, color: '#9AA1B4' }}>The password is hashed before it is stored and is never shown in the driver list.</div></div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.action === 'delete' ? 'Delete driver' : pendingAction?.driver?.accountStatus === 'Suspended' ? 'Activate driver' : 'Deactivate driver'}
        message={pendingAction?.action === 'delete'
          ? `Delete ${pendingAction?.driver?.name || 'this driver'}? Their portal account will be removed and any shipment assignments will be cleared.`
          : `${pendingAction?.driver?.accountStatus === 'Suspended' ? 'Restore' : 'Disable'} portal access for ${pendingAction?.driver?.name || 'this driver'}?`}
        confirmLabel={pendingAction?.action === 'delete' ? 'Delete driver' : pendingAction?.driver?.accountStatus === 'Suspended' ? 'Activate' : 'Deactivate'}
        danger={pendingAction?.action === 'delete' || pendingAction?.driver?.accountStatus !== 'Suspended'}
        loading={busy}
        onConfirm={confirmAction}
        onCancel={() => { if (!busy) setPendingAction(null); }}
      />
    </PortalLayout>
  );
}
