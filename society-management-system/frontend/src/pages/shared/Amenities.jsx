import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, CalendarClock, Waves, Dumbbell, PartyPopper, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/endpoints';
import { PageHeader, EmptyState } from '../../components/PageHeader';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const iconFor = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('pool') || n.includes('swim')) return Waves;
  if (n.includes('gym')) return Dumbbell;
  if (n.includes('club') || n.includes('hall') || n.includes('party')) return PartyPopper;
  return CalendarClock;
};

export default function Amenities() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookModal, setBookModal] = useState(null);
  const [amenityModal, setAmenityModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookForm, setBookForm] = useState({ date: '', startTime: '', endTime: '', notes: '' });
  const [amenityForm, setAmenityForm] = useState({ name: '', description: '', capacity: '', pricePerHour: '' });

  const load = () => {
    setLoading(true);
    Promise.all([api.getAmenities(), api.getBookings()])
      .then(([a, b]) => {
        setAmenities(a.data.amenities);
        setBookings(b.data.bookings);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleBook = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createBooking({ amenity: bookModal._id, ...bookForm });
      toast.success('Booking request submitted');
      setBookModal(null);
      setBookForm({ date: '', startTime: '', endTime: '', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not book amenity');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAmenity = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAmenity(amenityForm);
      toast.success('Amenity added');
      setAmenityModal(false);
      setAmenityForm({ name: '', description: '', capacity: '', pricePerHour: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add amenity');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.cancelBooking(id);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await api.updateBookingStatus(id, status);
      toast.success(`Booking ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update booking');
    }
  };

  const handleDeleteAmenity = async (id) => {
    if (!confirm('Remove this amenity?')) return;
    try {
      await api.deleteAmenity(id);
      toast.success('Amenity removed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove amenity');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader
        eyebrow="Community"
        title="Amenities & bookings"
        description="Reserve shared facilities and manage time slots."
        action={
          isAdmin && (
            <button
              onClick={() => setAmenityModal(true)}
              className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> Add amenity
            </button>
          )
        }
      />

      {amenities.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No amenities configured" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {amenities.map((a) => {
            const Icon = iconFor(a.name);
            return (
              <div key={a._id} className="ledger-card p-5">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-navy/5 text-navy"><Icon size={20} /></div>
                  {isAdmin && (
                    <button onClick={() => handleDeleteAmenity(a._id)} className="p-1.5 text-ink-soft hover:text-danger hover:bg-danger-soft rounded-md">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="font-display text-lg text-navy-dark mt-3">{a.name}</p>
                <p className="text-sm text-ink-soft mt-1">{a.description}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-ink-soft">
                  <span>Capacity: {a.capacity}</span>
                  <span>{a.pricePerHour > 0 ? `₹${a.pricePerHour}/hr` : 'Free'}</span>
                </div>
                <button
                  onClick={() => setBookModal(a)}
                  className="w-full mt-4 bg-navy hover:bg-navy-light text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Book now
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="label-eyebrow mb-3">{isAdmin ? 'All bookings' : 'My bookings'}</p>
      {bookings.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No bookings yet" />
      ) : (
        <div className="ledger-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Amenity</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Booked by</th>}
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3 text-ink">{b.amenity?.name}</td>
                  {isAdmin && <td className="px-4 py-3 text-ink-soft">{b.bookedBy?.name}</td>}
                  <td className="px-4 py-3 text-ink-soft">{format(new Date(b.date), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3 text-ink-soft">{b.startTime} - {b.endTime}</td>
                  <td className="px-4 py-3 font-mono text-ink-soft">₹{b.totalCost}</td>
                  <td className="px-4 py-3"><Badge>{b.status}</Badge></td>
                  <td className="px-4 py-3 flex gap-2">
                    {isAdmin && b.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(b._id, 'approved')} className="text-xs bg-success text-white px-2.5 py-1 rounded-md">Approve</button>
                        <button onClick={() => handleApprove(b._id, 'rejected')} className="text-xs bg-danger text-white px-2.5 py-1 rounded-md">Reject</button>
                      </>
                    )}
                    {!isAdmin && ['pending', 'approved'].includes(b.status) && (
                      <button onClick={() => handleCancel(b._id)} className="text-xs text-danger hover:bg-danger-soft px-2.5 py-1 rounded-md">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bookModal && (
        <Modal open={!!bookModal} onClose={() => setBookModal(null)} title={`Book ${bookModal.name}`}>
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink">Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookForm.date}
                onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink">Start time</label>
                <input
                  type="time"
                  required
                  value={bookForm.startTime}
                  onChange={(e) => setBookForm({ ...bookForm, startTime: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">End time</label>
                <input
                  type="time"
                  required
                  value={bookForm.endTime}
                  onChange={(e) => setBookForm({ ...bookForm, endTime: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Notes (optional)</label>
              <textarea
                rows={2}
                value={bookForm.notes}
                onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
              {saving ? 'Booking…' : 'Request booking'}
            </button>
          </form>
        </Modal>
      )}

      <Modal open={amenityModal} onClose={() => setAmenityModal(false)} title="Add a new amenity">
        <form onSubmit={handleCreateAmenity} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Name</label>
            <input
              required
              value={amenityForm.name}
              onChange={(e) => setAmenityForm({ ...amenityForm, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Description</label>
            <textarea
              rows={2}
              value={amenityForm.description}
              onChange={(e) => setAmenityForm({ ...amenityForm, description: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Capacity</label>
              <input
                type="number"
                required
                value={amenityForm.capacity}
                onChange={(e) => setAmenityForm({ ...amenityForm, capacity: Number(e.target.value) })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Price / hour (₹)</label>
              <input
                type="number"
                value={amenityForm.pricePerHour}
                onChange={(e) => setAmenityForm({ ...amenityForm, pricePerHour: Number(e.target.value) })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? 'Saving…' : 'Add amenity'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
