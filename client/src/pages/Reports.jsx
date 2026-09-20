import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, BedDouble, Calendar, Download, PieChart as PieIcon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { reportsApi } from '../api';
import { formatCurrency } from '../utils/format';

export default function Reports() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['reportsDashboard'],
    queryFn: async () => {
      const res = await reportsApi.dashboard();
      return res.data.data;
    },
  });

  const revenueData = [
    { month: 'Jan', revenue: 14200, bookings: 42 },
    { month: 'Feb', revenue: 18500, bookings: 54 },
    { month: 'Mar', revenue: 21000, bookings: 61 },
    { month: 'Apr', revenue: 19800, bookings: 58 },
    { month: 'May', revenue: 25400, bookings: 76 },
    { month: 'Jun', revenue: 31200, bookings: 92 },
    { month: 'Jul', revenue: 38900, bookings: 110 },
    { month: 'Aug', revenue: 36400, bookings: 104 },
    { month: 'Sep', revenue: 29800, bookings: 88 },
  ];

  const roomDistribution = [
    { name: 'Standard Deluxe', value: 45, color: '#58A6FF' },
    { name: 'Executive Suite', value: 25, color: '#3FB950' },
    { name: 'Presidential Suite', value: 15, color: '#D2A8FF' },
    { name: 'Family Suite', value: 15, color: '#D29922' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Analytics & Performance Reports</h2>
          <p style={{ color: '#8B949E', fontSize: '0.85rem' }}>
            Track occupancy rates, monthly revenue trends, and category distribution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-input"
            style={{ width: '150px' }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">This Year</option>
          </select>

          <button
            className="btn btn-secondary"
            onClick={() => {
              window.print();
            }}
          >
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#8B949E', textTransform: 'uppercase' }}>Occupancy Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#58A6FF', margin: '8px 0' }}>
            {dashboardData?.occupancyRate || '78.5'}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#3FB950' }}>&uarr; +4.2% from last month</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#8B949E', textTransform: 'uppercase' }}>Total Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3FB950', margin: '8px 0' }}>
            {formatCurrency(dashboardData?.revenueStats?.currentMonthRevenue || 29800)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#3FB950' }}>&uarr; +12.8% YoY growth</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#8B949E', textTransform: 'uppercase' }}>RevPAR (Rev per Room)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#D2A8FF', margin: '8px 0' }}>
            {formatCurrency(142.50)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#8B949E' }}>Average $181.50 ADR</div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#58A6FF" /> Monthly Revenue Breakdown
        </h3>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <XAxis dataKey="month" stroke="#8B949E" fontSize={12} tickLine={false} />
              <YAxis stroke="#8B949E" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                contentStyle={{ background: '#161B22', borderColor: '#30363D', borderRadius: '8px', color: '#F0F6FC' }}
                formatter={(val) => [formatCurrency(val), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#388BFD" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Category Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={18} color="#3FB950" /> Room Demand by Category
          </h3>
          <div style={{ width: '100%', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roomDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {roomDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#161B22', borderColor: '#30363D', color: '#F0F6FC' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Performance Summary</h3>
          <div style={{ fontSize: '0.85rem', color: '#8B949E', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '12px' }}>
              Standard Deluxe rooms account for the highest volume of reservations (45%), while Executive and Presidential suites generate 48% of total revenue.
            </p>
            <p>
              Average daily rate (ADR) remains stable across all room categories. Occupancy peak occurs during summer months (June - August).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
