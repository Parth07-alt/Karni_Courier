/**
 * AWB number generator for Karni Air Courier
 * Format: KAC + YYMMDD + 4-digit sequence
 */
export const generateAWB = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `KAC${yy}${mm}${dd}${seq}`;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getPickupDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      date: d,
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      isToday: i === 0,
    });
  }
  return dates;
};

export const STATUS_LABELS = {
  pending:      { label: 'Booking Pending',     icon: 'fa-clock',           color: '#F59E0B' },
  pickedup:     { label: 'Picked Up (Forwarded)',icon: 'fa-truck-fast',     color: '#7C3AED' },
  cancelled:    { label: 'Cancelled',           icon: 'fa-circle-xmark',    color: '#DC2626' },
};

export const STATUS_FLOW = ['pending','pickedup'];

export const getBadgeClass = (status) => {
  const map = {
    pending: 'badge-pending', pickedup: 'badge-picked', cancelled: 'badge-cancelled',
  };
  return map[status] || 'badge-pending';
};
