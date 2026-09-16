import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '077 000 0000', address: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success('Profile updated');
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Customer / <b style={{ color: '#697086' }}>Profile</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>My profile</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 24, maxWidth: 480 }}>
        {[['name', 'Full name'], ['email', 'Email address'], ['phone', 'Phone number'], ['address', 'Default address']].map(([name, label]) => (
          <div key={name} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#697086', display: 'block', marginBottom: 6 }}>{label}</label>
            <input value={form[name]} onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))} style={{ width: '100%', border: '1.5px solid #E3E7EF', borderRadius: 9, padding: '10px 12px', fontSize: 13 }} />
          </div>
        ))}
        <Button type="submit" variant="accent" icon={Save}>Save changes</Button>
      </form>
    </PortalLayout>
  );
}
