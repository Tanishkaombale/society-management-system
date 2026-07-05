const styles = {
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  neutral: 'bg-paper text-ink-soft border border-border',
  amber: 'bg-amber-soft text-amber-dark',
};

const statusMap = {
  paid: 'success',
  resolved: 'success',
  approved: 'success',
  active: 'success',
  'checked-out': 'success',
  occupied: 'success',
  pending: 'warning',
  'pending-approval': 'warning',
  overdue: 'danger',
  rejected: 'danger',
  inactive: 'danger',
  cancelled: 'danger',
  'in-progress': 'info',
  'checked-in': 'info',
  vacant: 'neutral',
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
};

export default function Badge({ children, tone }) {
  const key = tone || (typeof children === 'string' ? statusMap[children.toLowerCase()] : null) || 'neutral';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[key]}`}
    >
      {children}
    </span>
  );
}
