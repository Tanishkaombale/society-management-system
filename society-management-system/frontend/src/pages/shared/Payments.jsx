import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/endpoints';
import { PageHeader, EmptyState } from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const months = [
  'January','February','March','April','May','June','July','August','September','October','November','December',
];

export default function Payments() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [payments, setPayments] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    flat: '', resident: '', amount: '', month: months[new Date().getMonth()], year: new Date().getFullYear(), dueDate: '', remarks: '',
  });

  const load = () => {
    setLoading(true);
    api.getPayments().then(({ data }) => setPayments(data.payments)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (isAdmin) {
      api.getFlats().then(({ data }) => setFlats(data.flats.filter((f) => f.owner)));
    }
  }, []);

  const handleFlatChange = (flatId) => {
    const flat = flats.find((f) => f._id === flatId);
    setForm({ ...form, flat: flatId, resident: flat?.owner?._id || '', amount: flat?.monthlyMaintenance || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createPayment(form);
      toast.success('Maintenance bill generated');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate bill');
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await api.markPaymentPaid(id, 'upi');
      toast.success('Payment marked as paid');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not process payment');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title={isAdmin ? 'Maintenance billing' : 'My payments'}
        description={isAdmin ? 'Generate and track maintenance dues for every flat.' : 'View and settle your maintenance dues.'}
        action={
          isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> Generate bill
            </button>
          )
        }
      />

      {loading ? (
        <Loader />
      ) : payments.length === 0 ? (
        <EmptyState icon={Receipt} title="No bills yet" description="Maintenance invoices will show up here." />
      ) : (
        <div className="ledger-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Invoice</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Resident</th>}
                <th className="px-4 py-3 font-medium">Flat</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Due date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{p.invoiceNumber}</td>
                  {isAdmin && <td className="px-4 py-3 text-ink">{p.resident?.name}</td>}
                  <td className="px-4 py-3 text-ink-soft">{p.flat?.block}-{p.flat?.flatNumber}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.month} {p.year}</td>
                  <td className="px-4 py-3 font-mono text-ink">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-ink-soft">{format(new Date(p.dueDate), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3"><Badge>{p.status}</Badge></td>
                  <td className="px-4 py-3">
                    {p.status !== 'paid' && !isAdmin && (
                      <button
                        onClick={() => handlePay(p._id)}
                        className="text-xs bg-success text-white px-3 py-1.5 rounded-md hover:opacity-90"
                      >
                        Pay now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate maintenance bill">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Flat</label>
            <select
              required
              value={form.flat}
              onChange={(e) => handleFlatChange(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            >
              <option value="">Select occupied flat</option>
              {flats.map((f) => (
                <option key={f._id} value={f._id}>{f.block}-{f.flatNumber} · {f.owner?.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Month</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              >
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Year</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Amount (₹)</label>
              <input
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Due date</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? 'Generating…' : 'Generate bill'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
