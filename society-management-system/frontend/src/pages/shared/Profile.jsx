import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/endpoints';
import { PageHeader } from '../../components/PageHeader';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone, password: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      const { data } = await api.updateMe(payload);
      setUser((u) => ({ ...u, ...data.user }));
      toast.success('Profile updated');
      setForm({ ...form, password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Account" title="My profile" description="Update your personal details and password." />

      <div className="ledger-card p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-navy text-white flex items-center justify-center text-xl font-semibold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-display text-lg text-navy-dark">{user.name}</p>
            <p className="text-sm text-ink-soft capitalize">{user.role} · {user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Full name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">New password (optional)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Leave blank to keep current password"
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <button type="submit" disabled={saving} className="bg-navy hover:bg-navy-light text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
