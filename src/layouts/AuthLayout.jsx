import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

/* Mini mock dashboard card */
function MockCard({ icon, label, value, change, up, color }) {
  return (
    <div className="mock-card" style={{ '--mc': color }}>
      <div className="mock-card__top">
        <span className="mock-card__icon">{icon}</span>
        <span className={`mock-card__badge mock-card__badge--${up ? 'up' : 'down'}`}>
          {up ? '↑' : '↓'} {change}
        </span>
      </div>
      <p className="mock-card__value">{value}</p>
      <p className="mock-card__label">{label}</p>
    </div>
  );
}

const cards = [
  { icon: '💰', label: 'Total Revenue',   value: '$84,290', change: '12.4%', up: true,  color: '#1b84ff' },
  { icon: '📦', label: 'Total Orders',    value: '3,842',   change: '8.1%',  up: true,  color: '#22c55e' },
  { icon: '👥', label: 'Active Users',    value: '12,560',  change: '5.3%',  up: true,  color: '#7239ea' },
  { icon: '📈', label: 'Conversion Rate', value: '3.24%',   change: '1.2%',  up: false, color: '#f59e0b' },
];

function AuthLayout({ theme, onToggleTheme }) {
  return (
    <div className="auth-layout">

      {/* ════════════════════════════════
          LEFT PANEL
      ════════════════════════════════ */}
      <div className="auth-layout__panel">
        {/* Animated background orbs */}
        <div className="ap-orb ap-orb--1" />
        <div className="ap-orb ap-orb--2" />
        <div className="ap-orb ap-orb--3" />
        <div className="ap-grid" />

        <div className="ap-content">

          {/* Brand */}
          <div className="ap-brand">
            <div className="ap-brand__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <span className="ap-brand__name">CONCEPS</span>
            <span className="ap-brand__tag">Admin</span>
          </div>

          {/* Hero copy */}
          <div className="ap-hero">
            <p className="ap-hero__eyebrow">
              <span className="ap-hero__dot" /> Trusted by 50,000+ teams
            </p>
            <h2 className="ap-hero__title">
              Your business,<br/>
              <span className="ap-hero__gradient">fully in control.</span>
            </h2>
            <p className="ap-hero__desc">
              One unified platform to track revenue, manage your team,
              monitor inventory and make data-driven decisions — fast.
            </p>
          </div>

          {/* Mock dashboard preview */}
          <div className="ap-mock">
            <div className="ap-mock__header">
              <div className="ap-mock__dots">
                <span style={{background:'#ff5f57'}}/><span style={{background:'#febc2e'}}/><span style={{background:'#28c840'}}/>
              </div>
              <span className="ap-mock__title">Dashboard Overview</span>
              <span className="ap-mock__live"><span className="ap-mock__live-dot"/>Live</span>
            </div>

            <div className="ap-mock__cards">
              {cards.map((c, i) => <MockCard key={i} {...c} />)}
            </div>

            {/* Mini bar chart */}
            <div className="ap-mock__chart">
              <div className="ap-mock__chart-header">
                <span>Weekly Revenue</span>
                <span className="ap-mock__chart-badge">+18.2% this week</span>
              </div>
              <div className="ap-mock__bars">
                {[40,65,45,80,60,90,75].map((h, i) => (
                  <div key={i} className="ap-mock__bar-wrap">
                    <div className="ap-mock__bar" style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
                  </div>
                ))}
              </div>
              <div className="ap-mock__days">
                {['M','T','W','T','F','S','S'].map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="ap-quote">
            <div className="ap-quote__stars">{'★★★★★'}</div>
            <p className="ap-quote__text">
              "Conceps transformed our workflow. Metrics, users and products — all in one beautiful place."
            </p>
            <div className="ap-quote__author">
              <div className="ap-quote__avatar">R</div>
              <div>
                <p className="ap-quote__name">Riya Menon</p>
                <p className="ap-quote__role">CTO · Finedge Labs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          RIGHT FORM PANEL
      ════════════════════════════════ */}
      <div className="auth-layout__form">
        <div className="auth-form__header">
          {/* Mobile logo */}
          <div className="auth-form__logo-mobile">
            <div className="ap-brand__icon ap-brand__icon--sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <span className="ap-brand__name ap-brand__name--dark">CONCEPS</span>
          </div>

          {/* Theme toggle */}
          <button
            className="auth-form__theme-btn"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
        </div>

        <div className="auth-form__body">
          <Outlet />
        </div>

        <footer className="auth-form__footer">
          © 2025 Conceps &nbsp;·&nbsp;
          <a href="#">Privacy</a> &nbsp;·&nbsp;
          <a href="#">Terms</a> &nbsp;·&nbsp;
          <a href="#">Help</a>
        </footer>
      </div>
    </div>
  );
}

export default AuthLayout;
