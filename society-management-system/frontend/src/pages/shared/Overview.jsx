import { useEffect, useState } from 'react';
import { Users, Building2, MessageSquareWarning, UserCheck, Receipt, ShieldAlert, Megaphone } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getStats } from '../../api/endpoints';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import { PageHeader, EmptyState } from '../../components/PageHeader';
import Badge from '../../components/Badge';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#16324f', '#e8a33d', '#2f855a', '#c53030', '#2b6cb0'];

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full={false} />;
  if (!stats) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${user.name.split(' ')[0]}`}
        description={
          user.role === 'admin'
            ? 'A snapshot of your society — occupancy, dues, complaints, and gate activity.'
            : user.role === 'security'
            ? "Today's gate activity at a glance."
            : 'Your dues, complaints, and society updates in one place.'
        }
      />

      {user.role === 'admin' && <AdminOverview stats={stats} />}
      {user.role === 'security' && <SecurityOverview stats={stats} />}
      {user.role === 'resident' && <ResidentOverview stats={stats} />}
    </div>
  );
}

function AdminOverview({ stats }) {
  const pieData = (stats.complaintsByStatus || []).map((c) => ({ name: c._id, value: c.count }));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Residents" value={stats.totalResidents} icon={Users} />
        <StatCard label="Occupied Flats" value={`${stats.occupiedFlats}/${stats.totalFlats}`} icon={Building2} />
        <StatCard label="Open Complaints" value={stats.pendingComplaints} icon={MessageSquareWarning} accent="amber" />
        <StatCard label="Visitors Inside" value={stats.activeVisitors} icon={UserCheck} />
        <StatCard label="Dues Pending" value={stats.pendingPayments} icon={Receipt} accent="amber" />
        <StatCard label="Collected" value={`₹${stats.totalCollected.toLocaleString('en-IN')}`} icon={Receipt} />
        <StatCard label="Approvals Waiting" value={stats.pendingApprovals} icon={ShieldAlert} accent="amber" />
        <StatCard label="Vacant Flats" value={stats.vacantFlats} icon={Building2} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 ledger-card p-5">
          <p className="label-eyebrow mb-4">Complaints by status</p>
          {pieData.length === 0 ? (
            <p className="text-sm text-ink-soft py-10 text-center">No complaints logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-3 ledger-card accent-amber p-5">
          <p className="label-eyebrow mb-4">Recent notices</p>
          <NoticeFeed notices={stats.recentNotices} />
        </div>
      </div>
    </>
  );
}

function SecurityOverview({ stats }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Visitors Inside" value={stats.activeVisitors} icon={UserCheck} />
        <StatCard label="Logged Today" value={stats.todayVisitors} icon={UserCheck} accent="amber" />
      </div>
      <div className="ledger-card accent-amber p-5">
        <p className="label-eyebrow mb-4">Recent notices</p>
        <NoticeFeed notices={stats.recentNotices} />
      </div>
    </>
  );
}

function ResidentOverview({ stats }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Open Complaints" value={stats.myComplaints} icon={MessageSquareWarning} />
        <StatCard label="Bills Pending" value={stats.myPendingPayments} icon={Receipt} accent="amber" />
        <StatCard label="Total Due" value={`₹${stats.myTotalDue.toLocaleString('en-IN')}`} icon={Receipt} />
      </div>
      <div className="ledger-card accent-amber p-5">
        <p className="label-eyebrow mb-4">Recent notices</p>
        <NoticeFeed notices={stats.recentNotices} />
      </div>
    </>
  );
}

function NoticeFeed({ notices }) {
  if (!notices || notices.length === 0) {
    return <EmptyState icon={Megaphone} title="No notices yet" description="Society announcements will appear here." />;
  }
  return (
    <div className="divide-y divide-border">
      {notices.map((n) => (
        <div key={n._id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">{n.title}</p>
              <p className="text-xs text-ink-soft mt-0.5 line-clamp-1">{n.description}</p>
            </div>
            {n.important && <Badge tone="danger">Important</Badge>}
          </div>
          <p className="text-[11px] text-ink-soft mt-1.5">
            {n.postedBy?.name} · {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
}
