import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, MessageSquareWarning, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/endpoints';
import { PageHeader, EmptyState } from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const categories = ['plumbing', 'electrical', 'security', 'cleanliness', 'noise', 'parking', 'other'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['pending', 'in-progress', 'resolved', 'rejected'];

export default function Complaints() {
  const { user } = useAuth();
  const canManage = user.role === 'admin' || user.role === 'security';
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [comment, setComment] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'other', priority: 'medium' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.getComplaints().then(({ data }) => setComplaints(data.complaints)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createComplaint(form);
      toast.success('Complaint raised successfully');
      setCreateOpen(false);
      setForm({ title: '', description: '', category: 'other', priority: 'medium' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not raise complaint');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (c) => {
    setActive(c);
    setDetailOpen(true);
  };

  const handleStatusChange = async (status) => {
    try {
      await api.updateComplaint(active._id, { status });
      toast.success('Status updated');
      load();
      setDetailOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.addComplaintComment(active._id, comment);
      setComment('');
      toast.success('Comment added');
      setDetailOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add comment');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Support"
        title={canManage ? 'Complaint tracker' : 'My complaints'}
        description={canManage ? 'Complaints raised by residents across the society.' : 'Raise and track issues with your flat or common areas.'}
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Raise complaint
          </button>
        }
      />

      {loading ? (
        <Loader />
      ) : complaints.length === 0 ? (
        <EmptyState icon={MessageSquareWarning} title="No complaints" description="Everything looks fine here." />
      ) : (
        <div className="ledger-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Title</th>
                {canManage && <th className="px-4 py-3 font-medium">Raised by</th>}
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {complaints.map((c) => (
                <tr key={c._id} className="hover:bg-paper/60 cursor-pointer transition-colors" onClick={() => openDetail(c)}>
                  <td className="px-4 py-3 font-medium text-ink">{c.title}</td>
                  {canManage && <td className="px-4 py-3 text-ink-soft">{c.raisedBy?.name}</td>}
                  <td className="px-4 py-3 capitalize text-ink-soft">{c.category}</td>
                  <td className="px-4 py-3"><Badge>{c.priority}</Badge></td>
                  <td className="px-4 py-3"><Badge>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-ink-soft">{format(new Date(c.createdAt), 'dd MMM yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Raise a complaint">
        <form onSubmit={handleCreate} className="space-y-4">
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
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              >
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? 'Submitting…' : 'Submit complaint'}
          </button>
        </form>
      </Modal>

      {/* Detail modal */}
      {active && (
        <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={active.title} width="max-w-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge>{active.category}</Badge>
              <Badge>{active.priority}</Badge>
              <Badge>{active.status}</Badge>
            </div>
            <p className="text-sm text-ink-soft">{active.description}</p>
            <p className="text-xs text-ink-soft">
              Raised by {active.raisedBy?.name} on {format(new Date(active.createdAt), 'dd MMM yyyy, hh:mm a')}
            </p>

            {canManage && (
              <div>
                <label className="text-sm font-medium text-ink">Update status</label>
                <select
                  defaultValue={active.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                >
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-ink mb-2">Comments</p>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {active.comments?.length ? active.comments.map((c, i) => (
                  <div key={i} className="bg-paper rounded-lg px-3 py-2 text-sm">
                    <p className="text-ink">{c.text}</p>
                    <p className="text-[11px] text-ink-soft mt-1">{c.postedBy?.name} · {format(new Date(c.createdAt), 'dd MMM, hh:mm a')}</p>
                  </div>
                )) : (
                  <p className="text-xs text-ink-soft">No comments yet.</p>
                )}
              </div>
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment…"
                  className="flex-1 rounded-lg border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                />
                <button type="submit" className="p-2.5 bg-navy hover:bg-navy-light text-white rounded-lg">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
