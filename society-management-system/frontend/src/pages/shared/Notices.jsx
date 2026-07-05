import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Megaphone, Trash2, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/endpoints';
import { PageHeader, EmptyState } from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const categories = ['general', 'maintenance', 'event', 'emergency', 'meeting'];

export default function Notices() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'general', important: false });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.getNotices().then(({ data }) => setNotices(data.notices)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', category: 'general', important: false });
    setModalOpen(true);
  };

  const openEdit = (n) => {
    setEditing(n);
    setForm({ title: n.title, description: n.description, category: n.category, important: n.important });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateNotice(editing._id, form);
        toast.success('Notice updated');
      } else {
        await api.createNotice(form);
        toast.success('Notice published');
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
    if (!confirm('Delete this notice?')) return;
    try {
      await api.deleteNotice(id);
      toast.success('Notice deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete notice');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Notice board"
        description="Announcements posted by the management committee."
        action={
          isAdmin && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> New notice
            </button>
          )
        }
      />

      {loading ? (
        <Loader />
      ) : notices.length === 0 ? (
        <EmptyState icon={Megaphone} title="No notices yet" description="Posted announcements will show up here." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {notices.map((n) => (
            <div key={n._id} className={`ledger-card ${n.important ? 'accent-amber' : ''} p-5`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="info">{n.category}</Badge>
                  {n.important && <Badge tone="danger">Important</Badge>}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(n)} className="p-1.5 text-ink-soft hover:text-navy hover:bg-paper rounded-md">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(n._id)} className="p-1.5 text-ink-soft hover:text-danger hover:bg-danger-soft rounded-md">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="font-display text-lg text-navy-dark mt-3">{n.title}</p>
              <p className="text-sm text-ink-soft mt-1.5">{n.description}</p>
              <p className="text-[11px] text-ink-soft mt-3">
                Posted by {n.postedBy?.name} · {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit notice' : 'Publish a notice'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                id="important"
                checked={form.important}
                onChange={(e) => setForm({ ...form, important: e.target.checked })}
                className="h-4 w-4 accent-amber-dark"
              />
              <label htmlFor="important" className="text-sm text-ink">Mark as important</label>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Publish notice'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
