import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Plus, Search, Filter, Eye, UserCheck, UserMinus,
  XCircle, Calculator, User, Phone, Mail, CreditCard, Receipt
} from 'lucide-react';
import { bookingsApi, roomsApi, roomTypesApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';
import { differenceInDays, parseISO } from 'date-fns';

export default function Bookings() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Form state for creating reservation
  const [guestForm, setGuestForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
  });

  const [bookingForm, setBookingForm] = useState({
    room_id: '',
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests_count: 1,
    special_requests: '',
  });

  // Calculate nights and estimated total rate in real-time
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await bookingsApi.getAll();
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const { data: availableRooms = [] } = useQuery({
    queryKey: ['availableRooms', bookingForm.check_in_date, bookingForm.check_out_date],
    queryFn: async () => {
      const res = await roomsApi.getAvailable({
        checkIn: bookingForm.check_in_date,
        checkOut: bookingForm.check_out_date,
      });
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: Boolean(bookingForm.check_in_date && bookingForm.check_out_date),
  });

  const selectedRoomObj = useMemo(() => {
    return availableRooms.find((r) => r.id === bookingForm.room_id);
  }, [availableRooms, bookingForm.room_id]);

  const numberOfNights = useMemo(() => {
    if (!bookingForm.check_in_date || !bookingForm.check_out_date) return 0;
    try {
      const diff = differenceInDays(parseISO(bookingForm.check_out_date), parseISO(bookingForm.check_in_date));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  }, [bookingForm.check_in_date, bookingForm.check_out_date]);

  const priceCalculation = useMemo(() => {
    const rType = selectedRoomObj?.roomType || selectedRoomObj?.RoomType;
    const baseRate = rType?.base_price || 0;
    const roomSubtotal = baseRate * numberOfNights;
    const tax = roomSubtotal * 0.10; // 10% tax
    const totalAmount = roomSubtotal + tax;
    return { baseRate, roomSubtotal, tax, totalAmount };
  }, [selectedRoomObj, numberOfNights]);

  const createBookingMutation = useMutation({
    mutationFn: (payload) => bookingsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['rooms']);
      toast.success('Reservation created successfully');
      handleCloseCreateModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create reservation');
    },
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action, data }) => {
      if (action === 'check-in') return bookingsApi.checkIn(id);
      if (action === 'check-out') return bookingsApi.checkOut(id);
      if (action === 'cancel') return bookingsApi.cancel(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['rooms']);
      toast.success(`Booking status changed: ${variables.action}`);
      setSelectedBooking(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed');
    },
  });

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setGuestForm({ first_name: '', last_name: '', email: '', phone: '', id_number: '' });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.room_id) {
      toast.warning('Please select a room');
      return;
    }
    if (numberOfNights <= 0) {
      toast.warning('Check-out date must be after check-in date');
      return;
    }

    createBookingMutation.mutate({
      guest: guestForm,
      ...bookingForm,
    });
  };

  const filteredBookings = bookings.filter((b) => {
    const g = b.guest || b.Guest;
    const r = b.room || b.Room;
    const guestName = (g?.full_name || `${g?.first_name || ''} ${g?.last_name || ''}`).toLowerCase();
    const ref = (b.booking_reference || '').toLowerCase();
    const roomNum = (r?.room_number || '').toLowerCase();
    const matchesSearch =
      guestName.includes(searchTerm.toLowerCase()) ||
      ref.includes(searchTerm.toLowerCase()) ||
      roomNum.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Filter and Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#8B949E' }} />
            <input
              type="text"
              placeholder="Search ref, guest, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
            style={{ width: '160px' }}
          >
            <option value="all">All Bookings</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> New Reservation
        </button>
      </div>

      {/* Bookings Table */}
      {isLoading ? (
        <div style={{ color: '#8B949E', textAlign: 'center', padding: '40px' }}>Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <CalendarCheck size={48} color="#8B949E" style={{ marginBottom: '16px' }} />
          <h3>No bookings found</h3>
          <p>Create a new reservation to populate the list.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Guest Name</th>
                <th>Room</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const g = b.guest || b.Guest;
                const r = b.room || b.Room;
                const rType = r?.roomType || r?.RoomType;
                const gName = g?.full_name || `${g?.first_name || ''} ${g?.last_name || ''}`.trim() || 'Guest';

                return (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#58A6FF' }}>{b.booking_reference}</td>
                    <td style={{ fontWeight: 600 }}>{gName}</td>
                    <td>
                      Room {r?.room_number || '—'} <span style={{ color: '#8B949E', fontSize: '0.8rem' }}>({rType?.name || 'Standard'})</span>
                    </td>
                  <td>{formatDate(b.check_in_date)}</td>
                  <td>{formatDate(b.check_out_date)}</td>
                  <td style={{ fontWeight: 600, color: '#3FB950' }}>{formatCurrency(b.total_amount)}</td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      onClick={() => setSelectedBooking(b)}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      )}

      {/* Create Reservation Modal with Realtime Rate Calculator */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="New Guest Reservation"
        maxWidth="720px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Guest details section */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#58A6FF', textTransform: 'uppercase', marginBottom: '12px' }}>
              1. Guest Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={guestForm.first_name}
                  onChange={(e) => setGuestForm({ ...guestForm, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={guestForm.last_name}
                  onChange={(e) => setGuestForm({ ...guestForm, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={guestForm.email}
                  onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Dates and Room Selection */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#58A6FF', textTransform: 'uppercase', marginBottom: '12px' }}>
              2. Stay Details & Room Selection
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">Check-In Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={bookingForm.check_in_date}
                  onChange={(e) => setBookingForm({ ...bookingForm, check_in_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Check-Out Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={bookingForm.check_out_date}
                  onChange={(e) => setBookingForm({ ...bookingForm, check_out_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Guests Count</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={bookingForm.guests_count}
                  onChange={(e) => setBookingForm({ ...bookingForm, guests_count: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Available Room * ({availableRooms.length} available)</label>
              <select
                className="form-input"
                value={bookingForm.room_id}
                onChange={(e) => setBookingForm({ ...bookingForm, room_id: e.target.value })}
                required
              >
                <option value="">-- Select Room --</option>
                {availableRooms.map((rm) => {
                  const rt = rm.roomType || rm.RoomType;
                  return (
                    <option key={rm.id} value={rm.id}>
                      Room {rm.room_number} — {rt?.name || 'Standard'} ({formatCurrency(rt?.base_price)}/night)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Live Rate Calculator breakdown */}
          <div
            style={{
              background: '#161B22',
              border: '1px solid #30363D',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#58A6FF', fontWeight: 600 }}>
              <Calculator size={18} /> Automated Rate Calculation
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#8B949E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Nights:</span>
                <strong style={{ color: '#F0F6FC' }}>{numberOfNights} night(s)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Room Rate:</span>
                <strong style={{ color: '#F0F6FC' }}>{formatCurrency(priceCalculation.baseRate)} / night</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal ({numberOfNights} nights):</span>
                <strong style={{ color: '#F0F6FC' }}>{formatCurrency(priceCalculation.roomSubtotal)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Occupancy Tax (10%):</span>
                <strong style={{ color: '#F0F6FC' }}>{formatCurrency(priceCalculation.tax)}</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid #30363D',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#3FB950',
                }}
              >
                <span>Estimated Total:</span>
                <span>{formatCurrency(priceCalculation.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseCreateModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createBookingMutation.isPending}>
              {createBookingMutation.isPending ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Booking Details & Action Modal */}
      <Modal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title={`Reservation Details: ${selectedBooking?.booking_reference || ''}`}
        maxWidth="600px"
      >
        {selectedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusBadge status={selectedBooking.status} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3FB950' }}>
                {formatCurrency(selectedBooking.total_amount)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#8B949E', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Guest Profile
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                  {(selectedBooking.guest || selectedBooking.Guest)?.full_name || `${(selectedBooking.guest || selectedBooking.Guest)?.first_name || ''} ${(selectedBooking.guest || selectedBooking.Guest)?.last_name || ''}`}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#8B949E' }}>{(selectedBooking.guest || selectedBooking.Guest)?.email}</div>
                <div style={{ fontSize: '0.85rem', color: '#8B949E' }}>{(selectedBooking.guest || selectedBooking.Guest)?.phone}</div>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#8B949E', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Room Info
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                  Room {(selectedBooking.room || selectedBooking.Room)?.room_number || '—'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#8B949E' }}>{((selectedBooking.room || selectedBooking.Room)?.roomType || (selectedBooking.room || selectedBooking.Room)?.RoomType)?.name || 'Standard'}</div>
                <div style={{ fontSize: '0.85rem', color: '#8B949E' }}>Floor {(selectedBooking.room || selectedBooking.Room)?.floor || 1}</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#8B949E' }}>Check-In: </span>
                  <strong>{formatDate(selectedBooking.check_in_date)}</strong>
                </div>
                <div>
                  <span style={{ color: '#8B949E' }}>Check-Out: </span>
                  <strong>{formatDate(selectedBooking.check_out_date)}</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #30363D', paddingTop: '16px' }}>
              {selectedBooking.status === 'confirmed' && (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => actionMutation.mutate({ id: selectedBooking.id, action: 'check-in' })}
                  disabled={actionMutation.isPending}
                >
                  <UserCheck size={16} /> Perform Check-In
                </button>
              )}

              {selectedBooking.status === 'checked_in' && (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, backgroundColor: '#238636', borderColor: '#2EA043' }}
                  onClick={() => actionMutation.mutate({ id: selectedBooking.id, action: 'check-out' })}
                  disabled={actionMutation.isPending}
                >
                  <UserMinus size={16} /> Complete Check-Out
                </button>
              )}

              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'checked_out' && (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this booking?')) {
                      actionMutation.mutate({
                        id: selectedBooking.id,
                        action: 'cancel',
                        data: { reason: 'Guest cancelled' },
                      });
                    }
                  }}
                  disabled={actionMutation.isPending}
                >
                  <XCircle size={16} /> Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
