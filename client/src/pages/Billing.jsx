import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Receipt, DollarSign, CreditCard, Printer, CheckCircle, Search,
  Plus, FileText, Calculator, ArrowRight
} from 'lucide-react';
import { bookingsApi, invoicesApi, paymentsApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';
import logoSvg from '../assets/logo.svg';

export default function Billing() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookingForBill, setSelectedBookingForBill] = useState(null);
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [printableInvoice, setPrintableInvoice] = useState(null);

  // Payment modal state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'credit_card',
    reference: '',
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await bookingsApi.getAll();
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (payload) => {
      // First get or fetch invoice for booking
      const invRes = await invoicesApi.getByBooking(payload.booking_id);
      const invoice = invRes.data.data;
      return paymentsApi.create({
        invoice_id: invoice.id,
        amount: parseFloat(payload.amount),
        payment_method: payload.payment_method,
        transaction_reference: payload.reference || `REF-${Math.floor(Math.random() * 1000000)}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('Payment recorded successfully!');
      setPaymentModalBooking(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    },
  });

  const handleOpenPayment = (booking) => {
    setPaymentModalBooking(booking);
    setPaymentForm({
      amount: (booking.total_amount || 0).toString(),
      payment_method: 'credit_card',
      reference: `PAY-${Date.now().toString().slice(-6)}`,
    });
  };

  const handleOpenPrint = (booking) => {
    setPrintableInvoice(booking);
  };

  const filteredBookings = bookings.filter((b) => {
    const g = b.guest || b.Guest;
    const name = (g?.full_name || `${g?.first_name || ''} ${g?.last_name || ''}`).toLowerCase();
    const ref = (b.booking_reference || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || ref.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Billing & Financial Invoices</h2>
          <p style={{ color: '#8B949E', fontSize: '0.85rem' }}>
            Manage room billing, tax calculations, manual payment processing, and invoice generation.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#8B949E' }} />
          <input
            type="text"
            placeholder="Search booking ref or guest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px' }}
          />
        </div>
      </div>

      {/* Bookings Billing Table */}
      {isLoading ? (
        <div style={{ color: '#8B949E', textAlign: 'center', padding: '40px' }}>Loading invoices...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <Receipt size={48} color="#8B949E" style={{ marginBottom: '16px' }} />
          <h3>No invoice records</h3>
          <p>No active billing records found matching your query.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice / Ref</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Nightly Rate</th>
                <th>Total Bill</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const g = b.guest || b.Guest;
                const r = b.room || b.Room;
                const rType = r?.roomType || r?.RoomType;
                const guestName = g?.full_name || `${g?.first_name || ''} ${g?.last_name || ''}`.trim() || 'Guest';

                return (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#58A6FF' }}>{b.booking_reference}</td>
                    <td style={{ fontWeight: 600 }}>
                      {guestName}
                    </td>
                    <td>Room {r?.room_number || '—'}</td>
                    <td>{formatCurrency(rType?.base_price ?? 150)}</td>
                    <td style={{ fontWeight: 700, color: '#3FB950' }}>{formatCurrency(b.total_amount)}</td>
                    <td>
                      <StatusBadge status={b.status === 'checked_out' ? 'paid' : 'pending'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => handleOpenPayment(b)}
                        >
                          <CreditCard size={14} /> Process Payment
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => handleOpenPrint(b)}
                        >
                          <Printer size={14} /> Invoice Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Payment Modal (No Stripe required, direct cashier calculator) */}
      <Modal
        isOpen={Boolean(paymentModalBooking)}
        onClose={() => setPaymentModalBooking(null)}
        title="Process Guest Payment"
        maxWidth="540px"
      >
        {paymentModalBooking && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processPaymentMutation.mutate({
                booking_id: paymentModalBooking.id,
                ...paymentForm,
              });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
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
                <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>Total Payable Amount</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3FB950' }}>
                  {formatCurrency(paymentModalBooking.total_amount)}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#8B949E' }}>
                <div>Ref: <strong style={{ color: '#58A6FF' }}>{paymentModalBooking.booking_reference}</strong></div>
                <div>Guest: <strong style={{ color: '#F0F6FC' }}>{(paymentModalBooking.guest || paymentModalBooking.Guest)?.full_name || `${(paymentModalBooking.guest || paymentModalBooking.Guest)?.first_name || ''} ${(paymentModalBooking.guest || paymentModalBooking.Guest)?.last_name || ''}`}</strong></div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-input"
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
              >
                <option value="credit_card">Credit / Debit Card (Terminal POS)</option>
                <option value="cash">Cash Payment</option>
                <option value="bank_transfer">Direct Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Reference / Receipt No</label>
              <input
                type="text"
                className="form-input"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setPaymentModalBooking(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={processPaymentMutation.isPending}>
                {processPaymentMutation.isPending ? 'Processing...' : 'Confirm & Mark Paid'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Printable Invoice Modal */}
      <Modal
        isOpen={Boolean(printableInvoice)}
        onClose={() => setPrintableInvoice(null)}
        title="Official Hotel Invoice"
        maxWidth="640px"
      >
        {printableInvoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Invoice Printable Content */}
            <div
              id="printable-area"
              style={{
                background: '#0D1117',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #30363D',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #30363D', paddingBottom: '16px' }}>
                <div>
                  <img src={logoSvg} alt="Grand Horizon" style={{ height: '48px', maxWidth: '200px', objectFit: 'contain', marginBottom: '4px' }} />
                  <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>100 Ocean Boulevard, Coastline</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F0F6FC' }}>INVOICE</div>
                  <div style={{ fontSize: '0.85rem', color: '#8B949E', fontFamily: 'monospace' }}>#{printableInvoice.booking_reference}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>Date: {formatDate(new Date())}</div>
                </div>
              </div>

              {/* Guest & Stay info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: '#8B949E', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Billed To</div>
                  <div style={{ fontWeight: 600, color: '#F0F6FC', marginTop: '4px' }}>
                    {(printableInvoice.guest || printableInvoice.Guest)?.full_name || `${(printableInvoice.guest || printableInvoice.Guest)?.first_name || ''} ${(printableInvoice.guest || printableInvoice.Guest)?.last_name || ''}`}
                  </div>
                  <div style={{ color: '#8B949E' }}>{(printableInvoice.guest || printableInvoice.Guest)?.email}</div>
                  <div style={{ color: '#8B949E' }}>{(printableInvoice.guest || printableInvoice.Guest)?.phone}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#8B949E', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Stay Info</div>
                  <div style={{ fontWeight: 600, color: '#F0F6FC', marginTop: '4px' }}>Room {(printableInvoice.room || printableInvoice.Room)?.room_number || '—'}</div>
                  <div style={{ color: '#8B949E' }}>{((printableInvoice.room || printableInvoice.Room)?.roomType || (printableInvoice.room || printableInvoice.Room)?.RoomType)?.name || 'Standard Suite'}</div>
                  <div style={{ color: '#8B949E' }}>
                    {formatDate(printableInvoice.check_in_date)} - {formatDate(printableInvoice.check_out_date)}
                  </div>
                </div>
              </div>

              {/* Charges breakdown table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #30363D', color: '#8B949E', textAlign: 'left' }}>
                    <th style={{ padding: '8px 0' }}>Description</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #21262D' }}>
                    <td style={{ padding: '10px 0' }}>
                      Room Accommodations ({((printableInvoice.room || printableInvoice.Room)?.roomType || (printableInvoice.room || printableInvoice.Room)?.RoomType)?.name || 'Standard Suite'})
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                      {formatCurrency(printableInvoice.total_amount * 0.9)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #21262D' }}>
                    <td style={{ padding: '10px 0' }}>State & Local Hospitality Tax (10%)</td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                      {formatCurrency(printableInvoice.total_amount * 0.1)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 0', fontWeight: 700, fontSize: '1rem' }}>Total Payable Amount</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: '#3FB950' }}>
                      {formatCurrency(printableInvoice.total_amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={16} /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
