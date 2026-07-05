import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Users, CheckCircle2, Trash2, Building2, Copy, Check, KeyRound } from 'lucide-react';
import * as api from '../../api/endpoints';
import { PageHeader, EmptyState } from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

export default function Residents() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedFlat, setSelectedFlat] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'security' });

  const load = () => {
    setLoading(true);
    api.getUsers().then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.getFlats({ status: 'vacant' }).then(({ data }) => setFlats(data.flats));
  }, []);

  const filtered = users.filter((u) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !u.isApproved;
    return u.role === filter;
  });

  const handleApprove = async (id) => {
    try {
      await api.approveUser(id);
      toast.success('User approved');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this user permanently?')) return;
    try {
      await api.deleteUser(id);
      toast.success('User removed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove user');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createUser(form);
      toast.success('User created');
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', phone: '', role: 'security' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create user');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedFlat) return;
    try {
      await api.assignFlat(assignModal._id, selectedFlat);
      toast.success('Flat assigned');
      setAssignModal(null);
      setSelectedFlat('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not assign flat');
    }
  };

  const copyCode = async () => {
    if (!user?.society?.code) return;
    try {
      await navigator.clipboard.writeText(user.society.code);
      setCopied(true);
      toast.success('Join code copied');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy — copy it manually');
    }
  };

  return (
    <div>
      {user?.society && (
        <div className="ledger-card accent-amber p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-soft text-amber-dark">
              <KeyRound size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                Share this code so residents can request to join <span className="font-semibold">{user.society.name}</span>
              </p>
              <p className="text-xs text-ink-soft">They'll enter it on the "Join a society" tab when they register.</p>
            </div>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-mono font-semibold tracking-wider px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            {user.society.code} {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
      )}

      <PageHeader
        eyebrow="People"
        title="Residents & staff"
        description="Approve join requests from residents, manage staff accounts, and assign flats."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add staff account
          </button>
        }
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'pending', 'resident', 'security', 'admin'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize border transition-colors ${
              filter === f ? 'bg-navy text-white border-navy' : 'bg-surface text-ink-soft border-border hover:border-navy/30'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="ledger-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Flat</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    <p>{u.email}</p>
                    <p className="text-xs">{u.phone}</p>
                  </td>
                  <td className="px-4 py-3"><Badge tone="info">{u.role}</Badge></td>
                  <td className="px-4 py-3 text-ink-soft">
                    {u.flat ? `${u.flat.block}-${u.flat.flatNumber}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.isApproved ? 'success' : 'warning'}>{u.isApproved ? 'Approved' : 'Pending'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {!u.isApproved && (
                        <button onClick={() => handleApprove(u._id)} className="p-1.5 text-success hover:bg-success-soft rounded-md" title="Approve">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {u.role === 'resident' && !u.flat && (
                        <button onClick={() => setAssignModal(u)} className="p-1.5 text-navy hover:bg-navy/5 rounded-md" title="Assign flat">
                          <Building2 size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(u._id)} className="p-1.5 text-danger hover:bg-danger-soft rounded-md" title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add staff / admin account">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Phone</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              >
                <option value="security">Security</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </Modal>

      {assignModal && (
        <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title={`Assign flat to ${assignModal.name}`}>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink">Vacant flats</label>
              <select
                required
                value={selectedFlat}
                onChange={(e) => setSelectedFlat(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              >
                <option value="">Select a flat</option>
                {flats.map((f) => (
                  <option key={f._id} value={f._id}>{f.block}-{f.flatNumber} ({f.type})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium">
              Assign flat
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
