import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useStore from '../../hooks/useStore';
import authApi from '../../api/authApi';

const emptyForm = { name: '', email: '', password: '', role: 'dispatcher', branch: '', merchantName: '' };

export default function UsersPage() {
  const { users, branches, addUser, setUserStatus, removeUser } = useStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => [u.name, u.email, u.role, u.branch].join(' ').toLowerCase().includes(term));
  }, [users, query]);

  // Creates a real login account in MongoDB (POST /api/auth/register, where
  // the password is hashed with bcrypt) and then adds the matching row to the
  // users list. The new person can sign in immediately with these details.
  const handleCreate = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!form.name || !form.email) {
      toast.error('Name and email are required.');
      return;
    }
    if (!form.password || form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (form.role === 'merchant' && !form.merchantName.trim()) {
      toast.error('Merchant name is required.');
      return;
    }

    const branch = form.branch || branches[0]?.name || '';
    const merchantName = form.role === 'merchant' ? form.merchantName.trim() : '';
    setSaving(true);
    try {
      await authApi.register({
        name: form.name,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        branch,
        merchantName,
      });
      addUser({ name: form.name, email: form.email.trim().toLowerCase(), role: form.role, branch, merchantName });
      toast.success(`${form.name} can now sign in with ${form.email}`);
      setForm(emptyForm);
      setOpen(false);
    } catch (error) {
      toast.error(error?.message || 'Could not create the account.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = (user) => {
    const next = user.status === 'Active' ? 'Suspended' : 'Active';
    setUserStatus(user.id, next);
    toast.success(`${user.name} is now ${next.toLowerCase()}`);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    removeUser(pendingDelete.id);
    toast.success(`Removed ${pendingDelete.name}`);
    setPendingDelete(null);
  };

  const columns = [
    { key: 'name', label: 'User' },
    { key: 'role', label: 'Role' },
    { key: 'branch', label: 'Branch' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  return (
    <PortalLayout>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Admin / <b style={{ color: '#697086' }}>Users</b></div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>User management</h1>
          <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>{users.length} accounts across admin, finance and dispatcher roles.</div>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>Add user</Button>
      </div>

      <div style={{ maxWidth: 380, marginBottom: 16 }}>
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." />
      </div>

      <Table
        columns={columns}
        data={filtered}
        rowKey="id"
        emptyMessage="No users match your search."
        renderRow={(user) => (
          <tr key={user.id}>
            <td>
              <div style={{ fontWeight: 600, color: '#12213F' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: '#9AA1B4' }}>{user.email}</div>
            </td>
            <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
            <td>{user.branch}</td>
            <td><StatusBadge status={user.status} tone={user.status === 'Active' ? 'teal' : 'coral'} /></td>
            <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button size="small" variant="secondary" onClick={() => handleToggleStatus(user)}>{user.status === 'Active' ? 'Suspend' : 'Activate'}</Button>
              <Button size="small" variant="danger" icon={Trash2} onClick={() => setPendingDelete(user)} />
            </td>
          </tr>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add user"
        description="Create a new admin, finance officer or dispatcher account."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create user'}</Button></>}
      >
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
          <div className="field">
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086' }}>Full name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
          </div>
          <div className="field">
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086' }}>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="jane@egotechworld.com" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
          </div>
          <div className="field">
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086' }}>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="At least 6 characters" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
            <div style={{ fontSize: 11, color: '#9AA1B4', marginTop: 4 }}>Saved to MongoDB as a bcrypt hash - the plain password is never stored.</div>
          </div>
          <div className="field">
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086' }}>Role</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
              <option value="admin">Administrator</option>
              <option value="finance">Finance Officer</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="merchant">Merchant</option>
              <option value="branch">Branch Manager</option>
            </select>
          </div>
          {form.role === 'merchant' ? (
            <div className="field">
              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086' }}>Merchant name</label>
              <input value={form.merchantName} onChange={(e) => setForm((p) => ({ ...p, merchantName: e.target.value }))} placeholder="e.g. Urban Mart" style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
              <div style={{ fontSize: 11, color: '#9AA1B4', marginTop: 4 }}>Links this account to their shipments, settlements and invoices.</div>
            </div>
          ) : (
            <div className="field">
              <label style={{ fontSize: 12, fontWeight: 600, color: '#697086' }}>Branch</label>
              <select value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }}>
                {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove user"
        message={pendingDelete ? `Remove ${pendingDelete.name} from the system? This cannot be undone.` : ''}
        confirmLabel="Remove"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </PortalLayout>
  );
}
