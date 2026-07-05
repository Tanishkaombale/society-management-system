import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, UserCheck, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/endpoints';
import { PageHeader, EmptyState } from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export default function Visitors() {
  const { user } = useAuth();
  const canLog = user.role === 'admin' || user.role === 'security';
  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', flatToVisit: '', vehicleNumber: '' });

  const load = () => {
    setLoading(true);
    api.getVisitors().then(({ data }) => setVisitors(data.visitors)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (canLog) {
      api.getFlats().then(({ data }) => setFlats(data.flats));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createVisitor(form);
      toast.success('Visitor logged at gate');
      setModalOpen(false);
      setForm({ name: '', phone: '', purpose: '', flatToVisit: '', vehicleNumber: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not log visitor');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async (id) => {
    try {
      await api.checkoutVisitor(id);
      toast.success('Visitor checked out');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not check out visitor');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Gate activity"
        title="Visitor log"
        description={canLog ? 'Record and track every visitor entering the premises.' : 'Visitors logged against your flat.'}
        action={
          canLog && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> Log visitor
            </button>
          )
        }
      />

      {loading ? (
        <Loader />
      ) : visitors.length === 0 ? (
        <EmptyState icon={UserCheck} title="No visitors logged" description="Gate entries will appear here." />
      ) : (
        <div className="ledger-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Visitor</th>
                <th className="px-4 py-3 font-medium">Purpose</th>
                <th className="px-4 py-3 font-medium">Flat</th>
                <th className="px-4 py-3 font-medium">Entry</th>
                <th className="px-4 py-3 font-medium">Exit</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canLog && <th className="px-4 py-3 font-medium"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visitors.map((v) => (
                <tr key={v._id} className="hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{v.name}</p>
                    <p className="text-xs text-ink-soft">{v.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{v.purpose}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {v.flatToVisit?.block}-{v.flatToVisit?.flatNumber}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{format(new Date(v.entryTime), 'dd MMM, hh:mm a')}</td>
                  <td className="px-4 py-3 text-ink-soft">{v.exitTime ? format(new Date(v.exitTime), 'dd MMM, hh:mm a') : '—'}</td>
                  <td className="px-4 py-3"><Badge>{v.status}</Badge></td>
                  {canLog && (
                    <td className="px-4 py-3">
                      {v.status === 'checked-in' && (
                        <button
                          onClick={() => handleCheckout(v._id)}
                          className="flex items-center gap-1 text-xs text-danger hover:bg-danger-soft px-2 py-1 rounded-md"
                        >
                          <LogOut size={13} /> Check out
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log a new visitor">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Visitor name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <div>
            <label className="text-sm font-medium text-ink">Purpose of visit</label>
            <input
              required
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Flat to visit</label>
              <select
                required
                value={form.flatToVisit}
                onChange={(e) => setForm({ ...form, flatToVisit: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              >
                <option value="">Select flat</option>
                {flats.map((f) => (
                  <option key={f._id} value={f._id}>{f.block}-{f.flatNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Vehicle no. (optional)</label>
              <input
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? 'Logging…' : 'Log visitor entry'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
