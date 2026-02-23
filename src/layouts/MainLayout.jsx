import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import './MainLayout.css';

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#1b84ff','#10b981','#f59e0b'];
const avatarColor = (name) => name ? AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] : '#1b84ff';

const mockNotifications = [
  { id: 1, type: 'user',    title: 'New user registered',       desc: 'Alice Johnson joined the platform',   time: '2 min ago',  read: false },
  { id: 2, type: 'order',   title: 'New order received',         desc: 'Order #1042 placed for $299.99',      time: '15 min ago', read: false },
  { id: 3, type: 'alert',   title: 'Low stock alert',            desc: 'Cloud Runner Pro is running low',     time: '1 hr ago',   read: false },
  { id: 4, type: 'success', title: 'Payment confirmed',          desc: 'Invoice #INV-2024-089 was paid',      time: '3 hr ago',   read: true  },
  { id: 5, type: 'user',    title: 'User role updated',          desc: 'Bob Martinez promoted to Manager',    time: 'Yesterday',  read: true  },
];

const notifIcon = {
  user:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  order:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  alert:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  success: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
};
const notifColor = { user: '#6366f1', order: '#1b84ff', alert: '#f59e0b', success: '#22c55e' };

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (!ref.current || ref.current.contains(e.target)) return; handler(); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

function MainLayout({ user, onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [notifOpen, setNotifOpen]           = useState(false);
  const [profileOpen, setProfileOpen]       = useState(false);
  const [notifications, setNotifications]   = useState(mockNotifications);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useClickOutside(notifRef,   () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  const handleToggleCollapse = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('sidebar_collapsed', next);
  };

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const handleLogout = () => { setProfileOpen(false); onLogout(); navigate('/signin'); };

  return (
    <div className={`main-layout${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        user={user}
        onLogout={onLogout}
      />

      <div className="main-layout__content">
        <header className="main-header glass-header">
          {/* Left */}
          <div className="main-header__left">
            <button className="main-header__menu-btn" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Right actions */}
          <div className="main-header__actions">

            {/* Theme toggle */}
            <button className="main-header__icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </button>

            {/* Notifications */}
            <div className="mh-dropdown-wrap" ref={notifRef}>
              <button
                className={`main-header__icon-btn${notifOpen ? ' mh-icon-active' : ''}`}
                onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
                aria-label="Notifications"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && <span className="main-header__badge">{unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="mh-notif-panel animate-fadeInScale">
                  <div className="mh-notif-header">
                    <div>
                      <h3>Notifications</h3>
                      {unreadCount > 0 && <span className="mh-notif-unread-chip">{unreadCount} new</span>}
                    </div>
                    {unreadCount > 0 && (
                      <button className="mh-notif-mark-all" onClick={markAllRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="mh-notif-list">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`mh-notif-item${n.read ? '' : ' mh-notif-item--unread'}`}
                        onClick={() => markRead(n.id)}
                      >
                        <div className="mh-notif-icon" style={{ background: notifColor[n.type] + '18', color: notifColor[n.type] }}>
                          {notifIcon[n.type]}
                        </div>
                        <div className="mh-notif-body">
                          <p className="mh-notif-title">{n.title}</p>
                          <p className="mh-notif-desc">{n.desc}</p>
                          <p className="mh-notif-time">{n.time}</p>
                        </div>
                        {!n.read && <span className="mh-notif-dot" />}
                      </div>
                    ))}
                  </div>
                  <div className="mh-notif-footer">
                    <button onClick={() => setNotifOpen(false)}>View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="main-header__divider" />

            {/* User Avatar → profile popup */}
            <div className="mh-dropdown-wrap" ref={profileRef}>
              <button
                className="main-header__avatar"
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
                aria-label="User menu"
                style={{ background: `linear-gradient(135deg, ${avatarColor(user?.name)}, #7239ea)` }}
              >
                {user?.avatar || 'AU'}
              </button>

              {profileOpen && (
                <div className="mh-profile-panel animate-fadeInScale">
                  {/* Profile header */}
                  <div className="mh-profile-header">
                    <div
                      className="mh-profile-avatar"
                      style={{ background: `linear-gradient(135deg, ${avatarColor(user?.name)}, #7239ea)` }}
                    >
                      {user?.avatar || 'AU'}
                    </div>
                    <div>
                      <p className="mh-profile-name">{user?.name || 'Admin User'}</p>
                      <p className="mh-profile-email">{user?.email || 'admin@example.com'}</p>
                    </div>
                  </div>

                  {/* Role badge */}
                  <div className="mh-profile-role">
                    <span>{user?.role || 'Administrator'}</span>
                  </div>

                  {/* Menu items */}
                  <div className="mh-profile-menu">
                    <button className="mh-profile-item" onClick={() => { navigate('/profile'); setProfileOpen(false); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      My Profile
                    </button>
                    <button className="mh-profile-item" onClick={() => { navigate('/dashboard'); setProfileOpen(false); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                      Dashboard
                    </button>
                    <button className="mh-profile-item" onClick={onToggleTheme}>
                      {theme === 'light'
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
                      }
                      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                  </div>

                  <div className="mh-profile-divider" />

                  {/* Logout */}
                  <button className="mh-profile-logout" onClick={handleLogout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-layout__page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
