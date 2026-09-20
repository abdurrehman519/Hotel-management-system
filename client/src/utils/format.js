import { format } from 'date-fns';

export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0);

export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '—';
  try { return format(new Date(date), fmt); } catch { return date; }
};

export const nightCount = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
};

export const statusLabel = (status) => {
  const map = {
    available: 'Available', occupied: 'Occupied', maintenance: 'Maintenance',
    pending: 'Pending', confirmed: 'Confirmed', checked_in: 'Checked In',
    checked_out: 'Checked Out', cancelled: 'Cancelled', no_show: 'No Show',
    unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid', refunded: 'Refunded',
  };
  return map[status] || status;
};

export const roleLabel = (role) => {
  const map = { admin: 'Administrator', manager: 'Manager', receptionist: 'Receptionist' };
  return map[role] || role;
};
