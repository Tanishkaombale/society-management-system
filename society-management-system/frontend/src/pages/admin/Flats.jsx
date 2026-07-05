import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Building2, Trash2, Pencil } from 'lucide-react';
import * as api from '../../api/endpoints';
import { PageHeader, EmptyState } from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const flatTypes = ['1BHK', '2BHK', '3BHK', '4BHK', 'Duplex', 'Other'];

export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    flatNumber: '', block: '', floor: '', type: '2BHK', parkingSlots: 0, monthlyMaintenance: 2000,
  });

  const load = () => {
    setLoading(true);
    api.getFlats().then(({ data }) => setFlats(data.flats)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ flatNumber: '', block: '', floor: '', type: '2BHK', parkingSlots: 0, monthlyMaintenance: 2000 });
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({
      flatNumber: f.flatNumber, block: f.block, floor: f.floor, type: f.type,
      parkingSlots: f.parkingSlots, monthlyMaintenance: f.monthlyMaintenance,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateFlat(editing._id, form);
        toast.success('Flat updated');
      } else {
        await api.createFlat(form);
        toast.success('Flat created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this flat record?')) return;
    try {
      await api.deleteFlat(id);
      toast.success('Flat deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete flat');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Property"
        title="Flats & blocks"
        description="Manage the full inventory of flats across the society."
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add flat
          </button>
        }
      />

      {loading ? (
        <Loader />
      ) : flats.length === 0 ? (
        <EmptyState icon={Building2} title="No flats added yet" />
      ) : (
        <div className="ledger-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Flat</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Floor</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Maintenance</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {flats.map((f) => (
                <tr key={f._id} className="hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{f.block}-{f.flatNumber}</td>
                  <td className="px-4 py-3 text-ink-soft">{f.type}</td>
                  <td className="px-4 py-3 text-ink-soft">{f.floor}</td>
                  <td className="px-4 py-3 text-ink-soft">{f.owner?.name || '—'}</td>
                  <td className="px-4 py-3 font-mono text-ink-soft">₹{f.monthlyMaintenance.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><Badge>{f.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(f)} className="p-1.5 text-ink-soft hover:text-navy hover:bg-paper rounded-md">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(f._id)} className="p-1.5 text-ink-soft hover:text-danger hover:bg-danger-soft rounded-md">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit flat' : 'Add a new flat'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Block</label>
              <input
                required
                value={form.block}
                onChange={(e) => setForm({ ...form, block: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Flat number</label>
              <input
                required
                value={form.flatNumber}
                onChange={(e) => setForm({ ...form, flatNumber: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Floor</label>
              <input
                type="number"
                required
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              >
                {flatTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Parking slots</label>
              <input
                type="number"
                value={form.parkingSlots}
                onChange={(e) => setForm({ ...form, parkingSlots: Number(e.target.value) })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Monthly maintenance (₹)</label>
              <input
                type="number"
                value={form.monthlyMaintenance}
                onChange={(e) => setForm({ ...form, monthlyMaintenance: Number(e.target.value) })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add flat'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
