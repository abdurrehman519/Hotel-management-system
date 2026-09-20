require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, initDatabase } = require('../config/db');
const User = require('../models/User');
const Guest = require('../models/Guest');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');

async function runSeed(exitOnFinish = false) {
  try {
    await initDatabase();
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('[Seed] Tables created.');

    const adminHash = await bcrypt.hash('admin123', 12);
    const mgrHash = await bcrypt.hash('manager123', 12);
    const recHash = await bcrypt.hash('front123', 12);

    const admin = await User.create({ full_name: 'System Administrator', email: 'admin@grandhorizon.com', password_hash: adminHash, role: 'admin' });
    const mgr = await User.create({ full_name: 'Sarah Mitchell', email: 'manager@grandhorizon.com', password_hash: mgrHash, role: 'manager' });
    const rec = await User.create({ full_name: 'James Carter', email: 'front@grandhorizon.com', password_hash: recHash, role: 'receptionist' });
    console.log('[Seed] Staff created.');

    const standard = await RoomType.create({ name: 'Standard', description: 'Comfortable room with essential amenities, ideal for solo travellers and short stays.', base_price: 120.00, capacity: 2, amenities: 'Free Wi-Fi,Smart TV,Air Conditioning,Work Desk,Mini Fridge', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' });
    const deluxe = await RoomType.create({ name: 'Deluxe', description: 'Spacious room with premium furnishings and a partial city view.', base_price: 200.00, capacity: 2, amenities: 'Free Wi-Fi,Smart TV,Air Conditioning,King Bed,Bathtub,City View,Mini Bar', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800' });
    const suite = await RoomType.create({ name: 'Executive Suite', description: 'Luxurious suite with panoramic views, separate living area, and VIP services.', base_price: 450.00, capacity: 4, amenities: 'Free Wi-Fi,Smart TV,Air Conditioning,King Bed,Jacuzzi,Panoramic View,Mini Bar,Kitchenette,Lounge Area,Butler Service', image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800' });
    const family = await RoomType.create({ name: 'Family Room', description: 'Generous space designed for families with connecting beds and play area.', base_price: 280.00, capacity: 4, amenities: 'Free Wi-Fi,Smart TV,Air Conditioning,Twin Beds,King Bed,Bathtub,Garden View', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800' });
    console.log('[Seed] Room types created.');

    const rooms = await Room.bulkCreate([
      { room_number: '101', room_type_id: standard.id, floor: 1, status: 'available', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },
      { room_number: '102', room_type_id: standard.id, floor: 1, status: 'available', image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800' },
      { room_number: '103', room_type_id: standard.id, floor: 1, status: 'maintenance', image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800' },
      { room_number: '201', room_type_id: deluxe.id, floor: 2, status: 'available', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800' },
      { room_number: '202', room_type_id: deluxe.id, floor: 2, status: 'occupied', image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800' },
      { room_number: '203', room_type_id: deluxe.id, floor: 2, status: 'available', image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800' },
      { room_number: '301', room_type_id: suite.id, floor: 3, status: 'available', image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800' },
      { room_number: '302', room_type_id: suite.id, floor: 3, status: 'available', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800' },
      { room_number: '401', room_type_id: family.id, floor: 4, status: 'available', image_url: 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800' },
      { room_number: '402', room_type_id: family.id, floor: 4, status: 'available', image_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800' },
    ]);
    console.log('[Seed] Rooms created.');

    const g1 = await Guest.create({ full_name: 'William Turner', email: 'w.turner@email.com', phone: '+1-555-0101', id_document_type: 'Passport', id_document_no: 'US123456', nationality: 'American' });
    const g2 = await Guest.create({ full_name: 'Sophia Laurent', email: 's.laurent@email.com', phone: '+33-6-1234-5678', id_document_type: 'National ID', id_document_no: 'FR987654', nationality: 'French' });
    const g3 = await Guest.create({ full_name: 'Arjun Mehta', email: 'a.mehta@email.com', phone: '+91-9876543210', id_document_type: 'Passport', id_document_no: 'IN456789', nationality: 'Indian' });
    const g4 = await Guest.create({ full_name: 'Emma Watson', email: 'e.watson@email.com', phone: '+44-20-7946-0912', id_document_type: 'Passport', id_document_no: 'UK882910', nationality: 'British' });
    const g5 = await Guest.create({ full_name: 'David Beckham', email: 'd.beckham@email.com', phone: '+44-20-7946-0192', id_document_type: 'Driver License', id_document_no: 'UK772109', nationality: 'British' });
    const g6 = await Guest.create({ full_name: 'Elena Rostova', email: 'e.rostova@email.com', phone: '+49-30-123456', id_document_type: 'Passport', id_document_no: 'DE551920', nationality: 'German' });
    console.log('[Seed] 6 Guests created.');

    const today = new Date();
    const fmtDate = (d) => d.toISOString().split('T')[0];
    const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

    const b1 = await Booking.create({ booking_reference: 'BK-2026-001', guest_id: g1.id, room_id: rooms[3].id, check_in_date: fmtDate(today), check_out_date: fmtDate(addDays(today, 3)), adults: 2, children: 0, status: 'checked_in', total_amount: 600.00, created_by: rec.id, checked_in_by: rec.id });
    const b2 = await Booking.create({ booking_reference: 'BK-2026-002', guest_id: g2.id, room_id: rooms[6].id, check_in_date: fmtDate(addDays(today, 1)), check_out_date: fmtDate(addDays(today, 5)), adults: 2, children: 0, status: 'confirmed', total_amount: 1800.00, created_by: rec.id });
    const b3 = await Booking.create({ booking_reference: 'BK-2026-003', guest_id: g3.id, room_id: rooms[0].id, check_in_date: fmtDate(addDays(today, -5)), check_out_date: fmtDate(addDays(today, -2)), adults: 1, children: 0, status: 'checked_out', total_amount: 360.00, created_by: rec.id });
    console.log('[Seed] Bookings created.');

    const inv1 = await Invoice.create({ booking_id: b1.id, room_charges: 600.00, subtotal: 600.00, tax_rate: 10, tax_amount: 60.00, total: 660.00, status: 'partial' });
    const inv2 = await Invoice.create({ booking_id: b2.id, room_charges: 1800.00, subtotal: 1800.00, tax_rate: 10, tax_amount: 180.00, total: 1980.00, status: 'unpaid' });
    const inv3 = await Invoice.create({ booking_id: b3.id, room_charges: 360.00, subtotal: 360.00, tax_rate: 10, tax_amount: 36.00, total: 396.00, status: 'paid' });
    console.log('[Seed] Invoices created.');

    await Payment.create({ invoice_id: inv1.id, amount: 300.00, method: 'cash', recorded_by: rec.id });
    await Payment.create({ invoice_id: inv3.id, amount: 396.00, method: 'card', reference_no: 'TXN-2026-001', recorded_by: rec.id });
    console.log('[Seed] Payments created.');

    console.log('\n[Seed] Complete! Login credentials:');
    console.log('  Admin:       admin@grandhorizon.com  /  admin123');
    console.log('  Manager:     manager@grandhorizon.com  /  manager123');
    console.log('  Receptionist: front@grandhorizon.com  /  front123');

    if (exitOnFinish) process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err.message);
    if (exitOnFinish) process.exit(1);
    throw err;
  }
}

if (require.main === module) {
  runSeed(true);
}

module.exports = { runSeed };

