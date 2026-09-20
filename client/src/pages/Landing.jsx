import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Hotel, Calendar, Users, Search, BedDouble, Wifi, Tv, Coffee, Wind,
  CheckCircle, ArrowRight, ShieldCheck, Sparkles, Phone, Mail, Star, MapPin
} from 'lucide-react';
import { roomTypesApi, roomsApi, bookingsApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import logoSvg from '../assets/logo.svg';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [searchDates, setSearchDates] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    guests: 2,
  });

  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [bookingModalRoom, setBookingModalRoom] = useState(null);

  const [guestForm, setGuestForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
    special_requests: '',
  });

  const { data: roomTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ['publicRoomTypes'],
    queryFn: async () => {
      const res = await roomTypesApi.getAll();
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const { data: availableRooms = [], isLoading: loadingRooms } = useQuery({
    queryKey: ['publicRooms'],
    queryFn: async () => {
      const res = await roomsApi.getAll();
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const createGuestBookingMutation = useMutation({
    mutationFn: (payload) => bookingsApi.create(payload),
    onSuccess: (res) => {
      toast.success(`Reservation Confirmed! Booking Ref: ${res.data?.booking_reference || 'REF-SUCCESS'}`);
      setBookingModalRoom(null);
      setGuestForm({ first_name: '', last_name: '', email: '', phone: '', id_number: '', special_requests: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to place reservation');
    },
  });

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    if (!bookingModalRoom) return;

    createGuestBookingMutation.mutate({
      guest: {
        first_name: guestForm.first_name,
        last_name: guestForm.last_name,
        email: guestForm.email,
        phone: guestForm.phone,
        id_number: guestForm.id_number || 'N/A',
      },
      room_id: bookingModalRoom.id,
      check_in_date: searchDates.checkIn,
      check_out_date: searchDates.checkOut,
      guests_count: searchDates.guests,
      special_requests: guestForm.special_requests,
    });
  };

  const defaultRoomImages = [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200',
  ];

  const filteredTypes = roomTypes.filter((t) => selectedRoomType === 'all' || t.id === selectedRoomType);

  return (
    <div style={{ background: '#0D1117', color: '#F0F6FC', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header Navbar */}
      <header
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '20px 48px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(13, 17, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoSvg} alt="Grand Horizon Resort & Spa" style={{ height: '46px', maxWidth: '240px', objectFit: 'contain' }} />
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '0.9rem', fontWeight: 500, color: '#8B949E' }}>
          <a href="#suites" style={{ color: '#F0F6FC', textDecoration: 'none' }}>Suites & Rooms</a>
          <a href="#amenities" style={{ color: '#8B949E', textDecoration: 'none' }}>Amenities</a>
          <a href="#location" style={{ color: '#8B949E', textDecoration: 'none' }}>Contact</a>
        </nav>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(user ? '/dashboard' : '/login')}
          style={{
            borderColor: 'rgba(201, 168, 76, 0.3)',
            color: '#C9A84C',
            background: 'rgba(201, 168, 76, 0.08)',
          }}
        >
          {user ? 'Go to Dashboard' : 'Staff Portal Sign In'}
        </button>
      </header>

      {/* Hero Banner */}
      <section
        style={{
          position: 'relative',
          padding: '100px 48px 120px',
          backgroundImage: 'linear-gradient(to bottom, rgba(13, 17, 23, 0.4), rgba(13, 17, 23, 0.95)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              color: '#E8C96A',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Sparkles size={14} /> World-Class Coastal Luxury
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
            Experience Unmatched Comfort & Elegance
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#8B949E', maxWidth: '640px', lineHeight: 1.6 }}>
            Discover serenity overlooking the coastline. Enjoy bespoke butler services, private ocean-view suites, and award-winning dining.
          </p>

          {/* Quick Search Bar */}
          <div
            style={{
              marginTop: '20px',
              width: '100%',
              maxWidth: '860px',
              background: '#161B22',
              border: '1px solid #30363D',
              borderRadius: '16px',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: '16px',
              alignItems: 'end',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', color: '#8B949E', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                CHECK-IN
              </label>
              <input
                type="date"
                className="form-input"
                value={searchDates.checkIn}
                onChange={(e) => setSearchDates({ ...searchDates, checkIn: e.target.value })}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', color: '#8B949E', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                CHECK-OUT
              </label>
              <input
                type="date"
                className="form-input"
                value={searchDates.checkOut}
                onChange={(e) => setSearchDates({ ...searchDates, checkOut: e.target.value })}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', color: '#8B949E', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                GUESTS
              </label>
              <select
                className="form-input"
                value={searchDates.guests}
                onChange={(e) => setSearchDates({ ...searchDates, guests: parseInt(e.target.value) })}
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={4}>4 Guests</option>
              </select>
            </div>

            <a
              href="#suites"
              className="btn btn-primary"
              style={{
                height: '42px',
                background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)',
                color: '#0D1117',
                fontWeight: 700,
                padding: '0 24px',
              }}
            >
              Search Suites
            </a>
          </div>
        </div>
      </section>

      {/* Featured Suites Section */}
      <section id="suites" style={{ padding: '80px 48px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <div style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
              ACCOMMODATIONS
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginTop: '4px' }}>Our Featured Rooms & Suites</h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn"
              onClick={() => setSelectedRoomType('all')}
              style={{
                background: selectedRoomType === 'all' ? '#C9A84C' : '#161B22',
                color: selectedRoomType === 'all' ? '#0D1117' : '#8B949E',
                border: '1px solid #30363D',
              }}
            >
              All Categories
            </button>
            {roomTypes.map((t) => (
              <button
                key={t.id}
                className="btn"
                onClick={() => setSelectedRoomType(t.id)}
                style={{
                  background: selectedRoomType === t.id ? '#C9A84C' : '#161B22',
                  color: selectedRoomType === t.id ? '#0D1117' : '#8B949E',
                  border: '1px solid #30363D',
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {loadingTypes ? (
          <div style={{ textAlign: 'center', color: '#8B949E', padding: '60px' }}>Loading accommodations...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
            {filteredTypes.map((type, idx) => {
              const matchedRoom = availableRooms.find((r) => {
                const rTypeId = r.room_type_id || r.roomType?.id || r.RoomType?.id;
                return rTypeId === type.id && r.status === 'available';
              }) || availableRooms[0];
              const imgUrl = type.image_url || defaultRoomImages[idx % defaultRoomImages.length];

              const amenitiesList = Array.isArray(type.amenities)
                ? type.amenities
                : typeof type.amenities === 'string'
                ? type.amenities.split(',')
                : [];

              return (
                <motion.div
                  key={type.id}
                  whileHover={{ y: -6 }}
                  className="glass-card"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
                    <img
                      src={imgUrl}
                      alt={type.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(13, 17, 23, 0.8)',
                        backdropFilter: 'blur(8px)',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#C9A84C',
                        border: '1px solid rgba(201, 168, 76, 0.3)',
                      }}
                    >
                      {formatCurrency(type.base_price)}
                      <span style={{ fontSize: '0.75rem', color: '#8B949E', fontWeight: 400 }}> / night</span>
                    </div>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    <div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#F0F6FC' }}>{type.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#8B949E', marginTop: '4px' }}>
                        Accommodates up to {type.capacity} Guests
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#8B949E', lineHeight: '1.6' }}>
                      {type.description || 'Luxurious accommodations tailored for your comfort.'}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {amenitiesList.map((am, i) => (
                        <span
                          key={i}
                          style={{
                            background: '#21262D',
                            color: '#C9D1D9',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            border: '1px solid #30363D',
                          }}
                        >
                          {am.trim()}
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #30363D' }}>
                      <button
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          justify: 'center',
                          background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)',
                          color: '#0D1117',
                          fontWeight: 700,
                        }}
                        onClick={() => setBookingModalRoom({ type, room: matchedRoom })}
                      >
                        Reserve This Suite <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Guest Online Reservation Modal */}
      <Modal
        isOpen={Boolean(bookingModalRoom)}
        onClose={() => setBookingModalRoom(null)}
        title={`Complete Reservation: ${bookingModalRoom?.type?.name || ''}`}
        maxWidth="600px"
      >
        {bookingModalRoom && (
          <form onSubmit={handleReserveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: '#161B22',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #30363D',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F0F6FC' }}>{bookingModalRoom.type.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>
                  {searchDates.checkIn} &rarr; {searchDates.checkOut} ({searchDates.guests} Guests)
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 700, color: '#C9A84C' }}>
                {formatCurrency(bookingModalRoom.type.base_price)} / night
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John"
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
                  placeholder="Smith"
                  value={guestForm.last_name}
                  onChange={(e) => setGuestForm({ ...guestForm, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="john.smith@email.com"
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
                  placeholder="+1 555-0192"
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests (Optional)</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="High floor, extra pillows, late check-in..."
                value={guestForm.special_requests}
                onChange={(e) => setGuestForm({ ...guestForm, special_requests: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setBookingModalRoom(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)', color: '#0D1117', fontWeight: 700 }}
                disabled={createGuestBookingMutation.isPending}
              >
                {createGuestBookingMutation.isPending ? 'Confirming...' : 'Confirm Guest Reservation'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '40px 48px',
          textAlign: 'center',
          color: '#8B949E',
          fontSize: '0.85rem',
        }}
      >
        <p>&copy; {new Date().getFullYear()} Grand Horizon Hotel & Resort. All rights reserved.</p>
      </footer>
    </div>
  );
}
