// Client-Side Mock Database for GitHub Pages Live Demo Mode

const initialRoomTypes = [
  { id: 1, name: 'Standard', description: 'Comfortable room with essential amenities, ideal for solo travellers and short stays.', base_price: 120.00, capacity: 2, amenities: 'Free Wi-Fi,Smart TV,Air Conditioning,Work Desk,Mini Fridge', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },
  { id: 2, name: 'Deluxe', description: 'Spacious room with premium furnishings and a partial city view.', base_price: 200.00, capacity: 2, amenities: 'Free Wi-Fi,Smart TV,Air Conditioning,King Bed,Bathtub,City View,Mini Bar', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800' },
  { id: 3, name: 'Executive Suite', description: 'Luxurious suite with panoramic views, separate living area, and VIP services.', base_price: 450.00, capacity: 4, amenities: 'Free Wi-Fi,Smart TV,Air Conditioning,King Bed,Jacuzzi,Panoramic View,Mini Bar,Kitchenette,Lounge Area,Butler Service', image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800' },
  { id: 4, name: 'Family Room', description: 'Generous space designed for families with connecting beds and play area.', base_price: 280.00, capacity: 4, amenities: 'Free Wi-Fi,Smart TV,Air Conditioning,Twin Beds,King Bed,Bathtub,Garden View', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800' },
];

const initialRooms = [
  { id: 1, room_number: '101', room_type_id: 1, floor: 1, status: 'available', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', roomType: initialRoomTypes[0] },
  { id: 2, room_number: '102', room_type_id: 1, floor: 1, status: 'available', image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', roomType: initialRoomTypes[0] },
  { id: 3, room_number: '103', room_type_id: 1, floor: 1, status: 'maintenance', image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', roomType: initialRoomTypes[0] },
  { id: 4, room_number: '201', room_type_id: 2, floor: 2, status: 'available', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', roomType: initialRoomTypes[1] },
  { id: 5, room_number: '202', room_type_id: 2, floor: 2, status: 'occupied', image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800', roomType: initialRoomTypes[1] },
  { id: 6, room_number: '203', room_type_id: 2, floor: 2, status: 'available', image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', roomType: initialRoomTypes[1] },
  { id: 7, room_number: '301', room_type_id: 3, floor: 3, status: 'available', image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', roomType: initialRoomTypes[2] },
  { id: 8, room_number: '302', room_type_id: 3, floor: 3, status: 'available', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', roomType: initialRoomTypes[2] },
  { id: 9, room_number: '401', room_type_id: 4, floor: 4, status: 'available', image_url: 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800', roomType: initialRoomTypes[3] },
  { id: 10, room_number: '402', room_type_id: 4, floor: 4, status: 'available', image_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', roomType: initialRoomTypes[3] },
];

const initialGuests = [
  { id: 1, full_name: 'William Turner', email: 'w.turner@email.com', phone: '+1-555-0101', id_document_type: 'Passport', id_document_no: 'US123456', nationality: 'American' },
  { id: 2, full_name: 'Sophia Laurent', email: 's.laurent@email.com', phone: '+33-6-1234-5678', id_document_type: 'National ID', id_document_no: 'FR987654', nationality: 'French' },
  { id: 3, full_name: 'Arjun Mehta', email: 'a.mehta@email.com', phone: '+91-9876543210', id_document_type: 'Passport', id_document_no: 'IN456789', nationality: 'Indian' },
  { id: 4, full_name: 'Emma Watson', email: 'e.watson@email.com', phone: '+44-20-7946-0912', id_document_type: 'Passport', id_document_no: 'UK882910', nationality: 'British' },
];

const todayStr = new Date().toISOString().split('T')[0];
const nextStr = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

const initialBookings = [
  {
    id: 1,
    booking_reference: 'BK-2026-001',
    guest_id: 1,
    room_id: 4,
    check_in_date: todayStr,
    check_out_date: nextStr,
    adults: 2,
    children: 0,
    status: 'checked_in',
    total_amount: 600.00,
    guest: initialGuests[0],
    room: initialRooms[3],
    invoice: { id: 1, total: 660.00, status: 'partial', paid: 300.00 },
  },
  {
    id: 2,
    booking_reference: 'BK-2026-002',
    guest_id: 2,
    room_id: 7,
    check_in_date: todayStr,
    check_out_date: nextStr,
    adults: 2,
    children: 0,
    status: 'confirmed',
    total_amount: 1800.00,
    guest: initialGuests[1],
    room: initialRooms[6],
    invoice: { id: 2, total: 1980.00, status: 'unpaid', paid: 0.00 },
  },
];

const initialStaff = [
  { id: 1, full_name: 'System Administrator', email: 'admin@grandhorizon.com', role: 'admin', is_active: true, created_at: '2026-01-01' },
  { id: 2, full_name: 'Sarah Mitchell', email: 'manager@grandhorizon.com', role: 'manager', is_active: true, created_at: '2026-01-02' },
  { id: 3, full_name: 'James Carter', email: 'front@grandhorizon.com', role: 'receptionist', is_active: true, created_at: '2026-01-03' },
];

export const mockDb = {
  roomTypes: initialRoomTypes,
  rooms: initialRooms,
  guests: initialGuests,
  bookings: initialBookings,
  staff: initialStaff,
};

export const handleMockRequest = async (url, method = 'GET', data = null) => {
  // Normalize endpoint URL
  const path = url.replace(/^(?:https?:\/\/[^\/]+)?(?:\/api)?/, '');

  // Auth endpoints
  if (path.includes('/auth/login')) {
    const { email, password } = data || {};
    const valid = [
      { email: 'admin@grandhorizon.com', pass: 'admin123', name: 'System Administrator', role: 'admin' },
      { email: 'manager@grandhorizon.com', pass: 'manager123', name: 'Sarah Mitchell', role: 'manager' },
      { email: 'front@grandhorizon.com', pass: 'front123', name: 'James Carter', role: 'receptionist' },
    ];
    const match = valid.find(u => u.email === email && u.pass === password);
    if (!match) {
      const err = new Error('Invalid email or password.');
      err.response = { status: 401, data: { message: 'Invalid email or password.' } };
      throw err;
    }
    const token = `mock_jwt_token_${match.role}_${Date.now()}`;
    const user = { id: match.role === 'admin' ? 1 : match.role === 'manager' ? 2 : 3, full_name: match.name, email: match.email, role: match.role };
    return { data: { token, user } };
  }

  if (path.includes('/auth/profile')) {
    const storedUser = JSON.parse(localStorage.getItem('hms_user') || '{}');
    return { data: storedUser };
  }

  // Room Types
  if (path.includes('/room-types')) {
    return { data: mockDb.roomTypes };
  }

  // Rooms
  if (path.includes('/rooms')) {
    return { data: mockDb.rooms };
  }

  // Bookings
  if (path.includes('/bookings')) {
    if (method === 'POST') {
      const randRef = `BK-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const newBooking = {
        id: mockDb.bookings.length + 1,
        booking_reference: randRef,
        status: 'confirmed',
        total_amount: 500.00,
        guest: data.guest || { full_name: 'Guest User' },
        room: mockDb.rooms[0],
        ...data,
      };
      mockDb.bookings.unshift(newBooking);
      return { data: newBooking };
    }
    return { data: mockDb.bookings };
  }

  // Guests
  if (path.includes('/guests')) {
    return { data: mockDb.guests };
  }

  // Staff
  if (path.includes('/staff')) {
    return { data: mockDb.staff };
  }

  // Reports
  if (path.includes('/reports/dashboard') || path.includes('/reports')) {
    return {
      data: {
        totalRevenue: 2460.00,
        occupancyRate: 60,
        availableRooms: 6,
        occupiedRooms: 3,
        totalBookings: 12,
        pendingCheckIns: 2,
        todayCheckOuts: 1,
        monthlyRevenue: [
          { month: 'Jan', revenue: 4200 },
          { month: 'Feb', revenue: 5800 },
          { month: 'Mar', revenue: 7100 },
          { month: 'Apr', revenue: 6400 },
          { month: 'May', revenue: 8900 },
          { month: 'Jun', revenue: 9500 },
        ],
      },
    };
  }

  // Invoices & Payments fallback
  if (path.includes('/invoices') || path.includes('/payments')) {
    return {
      data: {
        id: 1,
        booking_id: 1,
        room_charges: 600.00,
        subtotal: 600.00,
        tax_rate: 10,
        tax_amount: 60.00,
        total: 660.00,
        status: 'paid',
        payments: [{ id: 1, amount: 660.00, method: 'card', createdAt: new Date().toISOString() }],
      },
    };
  }

  return { data: [] };
};
