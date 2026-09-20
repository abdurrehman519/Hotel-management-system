import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserCheck, UserMinus, Search, Clock, BedDouble, CalendarCheck } from 'lucide-react';
import { bookingsApi } from '../api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';

export default function CheckIn() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('checkin');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await bookingsApi.getAll();
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (id) => bookingsApi.checkIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['rooms']);
      toast.success('Guest checked in successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Check-in failed');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (id) => bookingsApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['rooms']);
      toast.success('Guest checked out successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Check-out failed');
    },
  });

  // Filter expected arrivals (status === 'confirmed') and current guests (status === 'checked_in')
  const expectedArrivals = bookings.filter((b) => b.status === 'confirmed');
  const checkedInGuests = bookings.filter((b) => b.status === 'checked_in');

  const displayList = (activeTab === 'checkin' ? expectedArrivals : checkedInGuests).filter((b) => {
    const g = b.guest || b.Guest;
    const r = b.room || b.Room;
    const name = (g?.full_name || `${g?.first_name || ''} ${g?.last_name || ''}`).toLowerCase();
    const ref = (b.booking_reference || '').toLowerCase();
    const roomNum = (r?.room_number || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || ref.includes(searchTerm.toLowerCase()) || roomNum.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Frontdesk stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(88, 166, 255, 0.15)', padding: '12px', borderRadius: '12px', color: '#58A6FF' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#8B949E', textTransform: 'uppercase' }}>Expected Check-Ins</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F6FC' }}>{expectedArrivals.length} Guests</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(63, 185, 80, 0.15)', padding: '12px', borderRadius: '12px', color: '#3FB950' }}>
            <UserMinus size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#8B949E', textTransform: 'uppercase' }}>Currently In Hotel</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F6FC' }}>{checkedInGuests.length} Guests</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', background: '#161B22', padding: '4px', borderRadius: '8px', border: '1px solid #30363D' }}>
          <button
            onClick={() => setActiveTab('checkin')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'checkin' ? '#21262D' : 'transparent',
              color: activeTab === 'checkin' ? '#F0F6FC' : '#8B949E',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <UserCheck size={16} /> Perform Check-In ({expectedArrivals.length})
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'checkout' ? '#21262D' : 'transparent',
              color: activeTab === 'checkout' ? '#F0F6FC' : '#8B949E',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <UserMinus size={16} /> Perform Check-Out ({checkedInGuests.length})
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#8B949E' }} />
          <input
            type="text"
            placeholder="Quick search guest or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px' }}
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ color: '#8B949E', textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : displayList.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} color="#8B949E" style={{ marginBottom: '16px' }} />
          <h3>No records found</h3>
          <p>{activeTab === 'checkin' ? 'No pending arrivals at the moment.' : 'No checked-in guests matching search.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {displayList.map((item) => {
            const g = item.guest || item.Guest;
            const r = item.room || item.Room;
            const rType = r?.roomType || r?.RoomType;
            const guestName = g?.full_name || `${g?.first_name || ''} ${g?.last_name || ''}`.trim() || 'Guest';

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -3 }}
                className="glass-card"
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F0F6FC' }}>
                      {guestName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#58A6FF', fontFamily: 'monospace' }}>
                      {item.booking_reference}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#21262D',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      textAlign: 'right',
                      border: '1px solid #30363D',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#8B949E' }}>Assigned Room</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3FB950' }}>
                      Room {r?.room_number || '—'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#8B949E', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Dates: {formatDate(item.check_in_date)} &rarr; {formatDate(item.check_out_date)}</div>
                  <div>Category: {rType?.name || 'Standard'}</div>
                  <div>Total Fee: <strong style={{ color: '#F0F6FC' }}>{formatCurrency(item.total_amount)}</strong></div>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #30363D' }}>
                  {activeTab === 'checkin' ? (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => checkInMutation.mutate(item.id)}
                      disabled={checkInMutation.isPending}
                    >
                      <UserCheck size={16} /> Confirm Guest Check-In
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', backgroundColor: '#238636', borderColor: '#2EA043' }}
                      onClick={() => checkOutMutation.mutate(item.id)}
                      disabled={checkOutMutation.isPending}
                    >
                      <UserMinus size={16} /> Complete Guest Check-Out
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
