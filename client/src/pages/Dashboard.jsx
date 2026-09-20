import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BedDouble, Users, CalendarCheck, DollarSign,
  TrendingUp, ArrowRight, UserCheck, UserMinus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import { reportsApi } from '../api';
import { formatCurrency, statusLabel } from '../utils/format';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ROOM_COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportsApi.dashboard().then((r) => r.data?.data || r.data),
  });

  if (isLoading) return <div className="loading-overlay"><div className="loading-spinner" /></div>;

  const payload = data?.rooms ? data : data?.data || {};
  const rooms = payload.rooms || {};
  const stats = payload.stats || {};
  const arrivals = payload.today_arrivals || [];
  const departures = payload.today_departures || [];

  const pieData = [
    { name: 'Available', value: rooms.available || 0 },
    { name: 'Occupied', value: rooms.occupied || 0 },
    { name: 'Maintenance', value: rooms.maintenance || 0 },
  ];

  const statCards = [
    { label: 'Total Rooms', value: rooms.total || 0, icon: BedDouble, color: 'blue', sub: 'Across all floors' },
    { label: 'Occupied Now', value: rooms.occupied || 0, icon: UserCheck, color: 'red', sub: `${rooms.total ? Math.round((rooms.occupied / rooms.total) * 100) : 0}% occupancy` },
    { label: 'Available', value: rooms.available || 0, icon: BedDouble, color: 'green', sub: 'Ready for guests' },
    { label: 'Total Guests', value: stats.total_guests || 0, icon: Users, color: 'purple', sub: 'Registered guests' },
    { label: 'Total Bookings', value: stats.total_bookings || 0, icon: CalendarCheck, color: 'amber', sub: `${stats.active_bookings || 0} active` },
    { label: 'Total Revenue', value: formatCurrency(stats.total_revenue || 0), icon: DollarSign, color: 'gold', sub: 'All-time payments' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Operations Dashboard</h1>
        <p className="page-subtitle">{format(new Date(), 'EEEE, d MMMM yyyy')} — Live overview of hotel operations.</p>
      </div>

      <div className="stat-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} className="stat-card" custom={i} initial="hidden" animate="visible" variants={cardVariants}>
              <div className={`stat-icon ${card.color}`}><Icon size={20} /></div>
              <div className="stat-body">
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-sub">{card.sub}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16, marginBottom: 20 }}>
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <div className="chart-header">
            <div className="chart-title">Revenue Trend — Last 7 Days</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={[
              { day: 'Mon', revenue: 1200 }, { day: 'Tue', revenue: 1850 }, { day: 'Wed', revenue: 1400 },
              { day: 'Thu', revenue: 2200 }, { day: 'Fri', revenue: 1900 }, { day: 'Sat', revenue: 3100 }, { day: 'Sun', revenue: 2700 },
            ]}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#718096' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#718096' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #E5EAF0', fontSize: 13 }} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Room Status</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={160} height={160}>
              <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={ROOM_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: ROOM_COLORS[i] }} />
                  <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Today's Arrivals</div>
              <div className="card-subtitle">{arrivals.length} guest{arrivals.length !== 1 ? 's' : ''} checking in today</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/check-in')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {arrivals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No arrivals scheduled for today.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {arrivals.map((b) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--card-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.guest?.full_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Room {b.room?.room_number}</div>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={() => navigate('/check-in')}>
                    <UserCheck size={13} /> Check In
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Today's Departures</div>
              <div className="card-subtitle">{departures.length} guest{departures.length !== 1 ? 's' : ''} checking out today</div>
            </div>
          </div>
          {departures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No departures scheduled for today.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {departures.map((b) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--card-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.guest?.full_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Room {b.room?.room_number}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/check-in')}>
                    <UserMinus size={13} /> Check Out
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
