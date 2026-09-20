import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BedDouble, ListChecks, UserCheck, Receipt,
  BarChart3, Users, Settings, LogOut, Hotel, ChevronLeft, ChevronRight,
  CalendarCheck, Key, FileText
} from 'lucide-react';

import logoSvg from '../../assets/logo.svg';

const navGroups = [
  {
    label: 'Operations',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'receptionist'] },
      { to: '/rooms', label: 'Rooms', icon: BedDouble, roles: ['admin', 'manager', 'receptionist'] },
      { to: '/room-types', label: 'Room Types', icon: Key, roles: ['admin'] },
      { to: '/bookings', label: 'Bookings', icon: CalendarCheck, roles: ['admin', 'manager', 'receptionist'] },
    ],
  },
  {
    label: 'Front Desk',
    items: [
      { to: '/check-in', label: 'Check-In', icon: UserCheck, roles: ['admin', 'manager', 'receptionist'] },
      { to: '/billing', label: 'Billing', icon: Receipt, roles: ['admin', 'manager', 'receptionist'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
      { to: '/staff', label: 'Staff', icon: Users, roles: ['admin'] },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'GH';

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src={logoSvg} alt="Grand Horizon HMS" style={{ height: '36px', maxWidth: '180px', objectFit: 'contain' }} />
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => {
          const visible = group.items.filter((i) => !i.roles || i.roles.includes(user?.role));
          if (!visible.length) return null;
          return (
            <div key={group.label}>
              <div className="sidebar-section-label">{group.label}</div>
              {visible.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
                    <Icon size={18} className="sidebar-item-icon" />
                    <span className="sidebar-item-label">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-item" onClick={handleLogout}>
          <LogOut size={18} className="sidebar-item-icon" />
          <span className="sidebar-item-label">Sign Out</span>
        </div>
      </div>

      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: -14,
          top: 80,
          width: 28,
          height: 28,
          background: '#21262D',
          border: '1px solid #30363D',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#8B949E',
          zIndex: 10,
          transition: 'all 0.2s ease',
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
