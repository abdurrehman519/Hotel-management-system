export function StatusBadge({ status, type = 'default' }) {
  const getStyle = () => {
    const s = String(status).toLowerCase();
    
    // Room status
    if (s === 'available') return { bg: 'rgba(35, 134, 54, 0.15)', color: '#3FB950', label: 'Available' };
    if (s === 'occupied') return { bg: 'rgba(248, 81, 73, 0.15)', color: '#FF7B72', label: 'Occupied' };
    if (s === 'maintenance') return { bg: 'rgba(210, 153, 34, 0.15)', color: '#D29922', label: 'Maintenance' };
    if (s === 'dirty' || s === 'cleaning') return { bg: 'rgba(163, 113, 247, 0.15)', color: '#D2A8FF', label: 'Cleaning' };

    // Booking status
    if (s === 'confirmed') return { bg: 'rgba(56, 139, 253, 0.15)', color: '#58A6FF', label: 'Confirmed' };
    if (s === 'checked_in') return { bg: 'rgba(35, 134, 54, 0.15)', color: '#3FB950', label: 'Checked In' };
    if (s === 'checked_out') return { bg: 'rgba(139, 148, 158, 0.15)', color: '#8B949E', label: 'Checked Out' };
    if (s === 'cancelled') return { bg: 'rgba(248, 81, 73, 0.15)', color: '#FF7B72', label: 'Cancelled' };

    // Payment / Invoice status
    if (s === 'paid') return { bg: 'rgba(35, 134, 54, 0.15)', color: '#3FB950', label: 'Paid' };
    if (s === 'pending') return { bg: 'rgba(210, 153, 34, 0.15)', color: '#D29922', label: 'Pending' };
    if (s === 'partially_paid') return { bg: 'rgba(56, 139, 253, 0.15)', color: '#58A6FF', label: 'Partial' };
    if (s === 'refunded') return { bg: 'rgba(163, 113, 247, 0.15)', color: '#D2A8FF', label: 'Refunded' };

    return { bg: 'rgba(139, 148, 158, 0.15)', color: '#8B949E', label: status };
  };

  const style = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        letterSpacing: '0.02em',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.color,
        }}
      />
      {style.label}
    </span>
  );
}

export default StatusBadge;
