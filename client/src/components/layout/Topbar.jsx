import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Topbar({ onToggle, pageTitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'GH';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="topbar">
      <button className="topbar-toggle" onClick={onToggle} id="sidebar-toggle-btn">
        <Menu size={18} />
      </button>
      <div className="topbar-breadcrumb">
        <strong>{pageTitle || 'Dashboard'}</strong>
      </div>
      <div className="topbar-actions">
        <span className="topbar-date">{format(new Date(), 'EEE, d MMM yyyy')}</span>
        <div className="topbar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{user?.full_name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Sign Out">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
