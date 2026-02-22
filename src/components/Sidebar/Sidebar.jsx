import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const icons = {
  dashboard: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  list:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  users:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  products:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  productDetail: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/></svg>,
  register:      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  logout:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  // Open = right-pointing panel icon (expand)
  open: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
      <polyline points="13 9 17 12 13 15"/>
    </svg>
  ),
  // Close = left-pointing panel icon (collapse)
  close: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
      <polyline points="5 9 1 12 5 15" transform="translate(10,0)"/>
    </svg>
  ),
};

const mainNav = [
  { label: 'Dashboard',    path: '/dashboard',   icon: icons.dashboard, exact: true },
  { label: 'Users',        path: '/users',        icon: icons.users },
  { label: 'Registration', path: '/registration', icon: icons.register },
  { label: 'Product List', path: '/products',     icon: icons.products },
];

function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => { onLogout(); navigate('/signin'); onClose(); };

  const renderItem = (item) => {
    const inner = (
      <>
        <span className="sidebar__nav-icon">{item.icon}</span>
        {!collapsed && <span className="sidebar__nav-text">{item.label}</span>}
      </>
    );
    return (
      <NavLink
        key={item.label}
        to={item.path}
        end={item.exact}
        className={({ isActive }) => `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`}
        onClick={() => { if (window.innerWidth < 768) onClose(); }}
        title={collapsed ? item.label : ''}
      >
        {inner}
      </NavLink>
    );
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}${collapsed ? ' sidebar--collapsed' : ''}`}>

        {/* ── Brand row ── */}
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">C</div>
          <span className="sidebar__brand-text">CONCEPS</span>
          <button
            className="sidebar__toggle-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              /* Right chevron → expand */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            ) : (
              /* Left chevron → collapse */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            )}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar__nav">
          <div className="sidebar__section">
            <div className="sidebar__section-items">
              {mainNav.map(renderItem)}
            </div>
          </div>
        </nav>

        {/* ── User footer ── */}
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">{user?.avatar || 'AU'}</div>
          {!collapsed && (
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{user?.name || 'Admin User'}</p>
              <p className="sidebar__user-role">{user?.role || 'Administrator'}</p>
            </div>
          )}
          <button className="sidebar__logout-btn" onClick={handleLogout} title="Sign out">
            {icons.logout}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
