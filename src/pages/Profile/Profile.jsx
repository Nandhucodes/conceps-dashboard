import { useState, useRef } from 'react';
import './Profile.css';

const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#1b84ff','#10b981','#f59e0b','#ef4444','#06b6d4',
];

function avatarColor(name) {
  return name ? AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] : '#1b84ff';
}

/* ── Toast ── */
function Toast({ message, type, onClose }) {
  return (
    <div className={`prof-toast prof-toast--${type} animate-slideInRight`}>
      <span className="prof-toast__icon">
        {type === 'success'
          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        }
      </span>
      <span className="prof-toast__msg">{message}</span>
      <button className="prof-toast__close" onClick={onClose}>✕</button>
    </div>
  );
}

/* ── Section header ── */
function SectionHead({ icon, title, subtitle, color = '#1b84ff', bg = '#e9f3ff' }) {
  return (
    <div className="prof-section__head">
      <div className="prof-section__icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <h3 className="prof-section__title">{title}</h3>
        {subtitle && <p className="prof-section__sub">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Field wrapper ── */
function Field({ label, children, hint, error }) {
  return (
    <div className="prof-field">
      <label className="prof-field__label">{label}</label>
      {children}
      {error && <p className="prof-field__error">{error}</p>}
      {!error && hint && <p className="prof-field__hint">{hint}</p>}
    </div>
  );
}

/* ── Input ── */
function PInput({ icon, ...props }) {
  return (
    <div className="prof-input-wrap">
      {icon && <span className="prof-input-icon">{icon}</span>}
      <input className={`prof-input${icon ? ' prof-input--icon' : ''}`} {...props} />
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Profile() {
  /* Pull user from localStorage */
  const stored = JSON.parse(localStorage.getItem('user') || '{}');

  /* ── Avatar ── */
  const [avatarSrc, setAvatarSrc]     = useState(null);
  const [avatarDrag, setAvatarDrag]   = useState(false);
  const fileRef = useRef();

  const handleAvatarFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  /* ── Personal info ── */
  const nameParts = (stored.name || 'Admin User').split(' ');
  const [personal, setPersonal] = useState({
    firstName:  nameParts[0] || '',
    lastName:   nameParts.slice(1).join(' ') || '',
    email:      stored.email || 'admin@example.com',
    phone:      '+1 (555) 000-0000',
    dob:        '',
    gender:     '',
    website:    '',
    bio:        'Passionate about building great products and leading high-performing teams.',
    location:   'San Francisco, CA',
    timezone:   'America/Los_Angeles',
  });
  const [personalErrors, setPersonalErrors] = useState({});

  /* ── Work info ── */
  const [work, setWork] = useState({
    company:    'Conceps Inc.',
    department: 'Engineering',
    role:       stored.role || 'Administrator',
    employeeId: 'EMP-00147',
    startDate:  '2022-03-15',
    manager:    'Sarah Mitchell',
  });

  /* ── Security ── */
  const [security, setSecurity] = useState({ currentPw: '', newPw: '', confirmPw: '' });
  const [showPw, setShowPw]     = useState({ current: false, new: false, confirm: false });
  const [secErrors, setSecErrors] = useState({});
  const [twoFA, setTwoFA]       = useState(false);
  const [sessions] = useState([
    { id: 1, device: 'Chrome on Windows', ip: '192.168.1.1',  time: 'Active now',    current: true },
    { id: 2, device: 'Safari on iPhone',  ip: '10.0.0.14',    time: '2 hours ago',   current: false },
    { id: 3, device: 'Firefox on Mac',    ip: '172.16.0.5',   time: '3 days ago',    current: false },
  ]);

  /* ── Preferences ── */
  const [prefs, setPrefs] = useState({
    emailNotifs:   true,
    pushNotifs:    false,
    weeklyReport:  true,
    productUpdates: true,
    language:      'en',
    dateFormat:    'MM/DD/YYYY',
    currency:      'USD',
  });

  /* ── Toasts ── */
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Save handlers ── */
  const savePersonal = () => {
    const errs = {};
    if (!personal.firstName.trim()) errs.firstName = 'First name is required';
    if (!personal.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email))
      errs.email = 'Valid email is required';
    setPersonalErrors(errs);
    if (Object.keys(errs).length) return;

    const updated = {
      ...stored,
      name:   `${personal.firstName} ${personal.lastName}`.trim(),
      email:  personal.email,
      avatar: `${personal.firstName[0]}${personal.lastName[0] || ''}`.toUpperCase(),
    };
    localStorage.setItem('user', JSON.stringify(updated));
    showToast('Personal info saved successfully!');
  };

  const saveWork = () => showToast('Work information updated!');

  const saveSecurity = () => {
    const errs = {};
    if (!security.currentPw) errs.currentPw = 'Current password is required';
    if (security.newPw.length < 8) errs.newPw = 'Password must be at least 8 characters';
    if (security.newPw !== security.confirmPw) errs.confirmPw = 'Passwords do not match';
    setSecErrors(errs);
    if (Object.keys(errs).length) return;
    setSecurity({ currentPw: '', newPw: '', confirmPw: '' });
    showToast('Password updated successfully!');
  };

  const savePrefs = () => showToast('Preferences saved!');

  const EyeIcon = ({ open }) => open
    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

  const initials = `${personal.firstName[0] || ''}${personal.lastName[0] || ''}`.toUpperCase() || 'AU';
  const color    = avatarColor(personal.firstName);

  return (
    <div className="profile animate-fadeIn">

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ══ PAGE HEADER ══ */}
      <div className="profile__hero">
        <div className="profile__hero-left">
          {/* Avatar */}
          <div
            className={`profile__avatar-wrap${avatarDrag ? ' profile__avatar-wrap--drag' : ''}`}
            onDragOver={e => { e.preventDefault(); setAvatarDrag(true); }}
            onDragLeave={() => setAvatarDrag(false)}
            onDrop={e => { e.preventDefault(); setAvatarDrag(false); handleAvatarFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
            title="Click or drag to change photo"
          >
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" className="profile__avatar-img" />
              : <div className="profile__avatar-initials" style={{ background: `linear-gradient(135deg, ${color}, #7239ea)` }}>{initials}</div>
            }
            <div className="profile__avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span>Change photo</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => handleAvatarFile(e.target.files[0])} />
          </div>

          {/* Name & meta */}
          <div className="profile__hero-info">
            <h1 className="profile__hero-name">{`${personal.firstName} ${personal.lastName}`.trim() || 'Admin User'}</h1>
            <p className="profile__hero-role">{work.role} · {work.department}</p>
            <div className="profile__hero-tags">
              <span className="profile__tag profile__tag--green">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                Active
              </span>
              <span className="profile__tag">{work.company}</span>
              <span className="profile__tag">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {personal.location}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="profile__hero-stats">
          {[
            { label: 'Member since', value: '2022', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            { label: 'Projects',     value: '24',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
            { label: 'Department',   value: work.department, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          ].map((s, i) => (
            <div key={i} className="profile__stat">
              <span className="profile__stat-icon">{s.icon}</span>
              <div>
                <p className="profile__stat-val">{s.value}</p>
                <p className="profile__stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="profile__body">

        {/* ══ PERSONAL INFO ══ */}
        <div className="prof-section">
          <SectionHead
            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            title="Personal Information"
            subtitle="Update your name, contact details, and public profile."
          />
          <div className="prof-grid">
            <Field label="First Name" error={personalErrors.firstName}>
              <PInput
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                placeholder="John"
                value={personal.firstName}
                onChange={e => setPersonal(p => ({ ...p, firstName: e.target.value }))}
              />
            </Field>
            <Field label="Last Name">
              <PInput
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                placeholder="Doe"
                value={personal.lastName}
                onChange={e => setPersonal(p => ({ ...p, lastName: e.target.value }))}
              />
            </Field>
            <Field label="Email Address" error={personalErrors.email}>
              <PInput
                type="email"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                placeholder="john@example.com"
                value={personal.email}
                onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))}
              />
            </Field>
            <Field label="Phone Number">
              <PInput
                type="tel"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.17 6.17l.97-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                placeholder="+1 (555) 000-0000"
                value={personal.phone}
                onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))}
              />
            </Field>
            <Field label="Date of Birth">
              <PInput
                type="date"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                value={personal.dob}
                onChange={e => setPersonal(p => ({ ...p, dob: e.target.value }))}
              />
            </Field>
            <Field label="Gender">
              <select
                className="prof-select"
                value={personal.gender}
                onChange={e => setPersonal(p => ({ ...p, gender: e.target.value }))}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </Field>
            <Field label="Location">
              <PInput
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                placeholder="City, Country"
                value={personal.location}
                onChange={e => setPersonal(p => ({ ...p, location: e.target.value }))}
              />
            </Field>
            <Field label="Timezone">
              <select className="prof-select" value={personal.timezone}
                onChange={e => setPersonal(p => ({ ...p, timezone: e.target.value }))}>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </Field>
            <Field label="Website / Portfolio">
              <PInput
                type="url"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                placeholder="https://yoursite.com"
                value={personal.website}
                onChange={e => setPersonal(p => ({ ...p, website: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Bio" hint={`${personal.bio.length}/300 characters`}>
            <textarea
              className="prof-textarea"
              rows={3}
              maxLength={300}
              placeholder="Tell your team a bit about yourself..."
              value={personal.bio}
              onChange={e => setPersonal(p => ({ ...p, bio: e.target.value }))}
            />
          </Field>
          <div className="prof-section__footer">
            <button className="prof-btn prof-btn--ghost" onClick={() => setPersonal(p => ({ ...p }))}>Discard changes</button>
            <button className="prof-btn prof-btn--primary" onClick={savePersonal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Save Personal Info
            </button>
          </div>
        </div>

        {/* ══ WORK INFO ══ */}
        <div className="prof-section">
          <SectionHead
            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
            title="Work Information"
            subtitle="Your job title, department, and company details."
            color="#8b5cf6"
            bg="#f3e8ff"
          />
          <div className="prof-grid">
            <Field label="Company">
              <PInput
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                placeholder="Company name"
                value={work.company}
                onChange={e => setWork(w => ({ ...w, company: e.target.value }))}
              />
            </Field>
            <Field label="Department">
              <select className="prof-select" value={work.department}
                onChange={e => setWork(w => ({ ...w, department: e.target.value }))}>
                {['Engineering','Design','Product','Marketing','Sales','Finance','HR','Operations','Legal'].map(d =>
                  <option key={d} value={d}>{d}</option>
                )}
              </select>
            </Field>
            <Field label="Role / Position">
              <PInput
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>}
                placeholder="e.g. Senior Developer"
                value={work.role}
                onChange={e => setWork(w => ({ ...w, role: e.target.value }))}
              />
            </Field>
            <Field label="Employee ID" hint="Assigned by HR — read only">
              <PInput
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
                value={work.employeeId}
                readOnly
              />
            </Field>
            <Field label="Start Date">
              <PInput
                type="date"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                value={work.startDate}
                onChange={e => setWork(w => ({ ...w, startDate: e.target.value }))}
              />
            </Field>
            <Field label="Reporting Manager">
              <PInput
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                placeholder="Manager name"
                value={work.manager}
                onChange={e => setWork(w => ({ ...w, manager: e.target.value }))}
              />
            </Field>
          </div>
          <div className="prof-section__footer">
            <button className="prof-btn prof-btn--ghost">Discard changes</button>
            <button className="prof-btn prof-btn--primary" onClick={saveWork}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Save Work Info
            </button>
          </div>
        </div>

        {/* ══ SECURITY ══ */}
        <div className="prof-section">
          <SectionHead
            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            title="Security & Password"
            subtitle="Keep your account secure by updating your password regularly."
            color="#ef4444"
            bg="#fef2f2"
          />

          {/* Change password */}
          <div className="prof-grid">
            <Field label="Current Password" error={secErrors.currentPw}>
              <div className="prof-input-wrap">
                <span className="prof-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  className="prof-input prof-input--icon"
                  type={showPw.current ? 'text' : 'password'}
                  placeholder="Your current password"
                  value={security.currentPw}
                  onChange={e => setSecurity(s => ({ ...s, currentPw: e.target.value }))}
                />
                <button type="button" className="prof-eye" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                  <EyeIcon open={showPw.current} />
                </button>
              </div>
            </Field>
            <div /> {/* spacer */}
            <Field label="New Password" error={secErrors.newPw} hint="At least 8 characters">
              <div className="prof-input-wrap">
                <span className="prof-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  className="prof-input prof-input--icon"
                  type={showPw.new ? 'text' : 'password'}
                  placeholder="New password"
                  value={security.newPw}
                  onChange={e => setSecurity(s => ({ ...s, newPw: e.target.value }))}
                />
                <button type="button" className="prof-eye" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}>
                  <EyeIcon open={showPw.new} />
                </button>
              </div>
              {/* Password strength */}
              {security.newPw && (
                <div className="prof-pw-strength">
                  {[1,2,3,4].map(i => {
                    const strength = security.newPw.length >= 12 && /[A-Z]/.test(security.newPw) && /[0-9]/.test(security.newPw) && /[^A-Za-z0-9]/.test(security.newPw) ? 4
                      : security.newPw.length >= 8 && /[A-Z]/.test(security.newPw) && /[0-9]/.test(security.newPw) ? 3
                      : security.newPw.length >= 8 ? 2 : 1;
                    return <div key={i} className={`prof-pw-bar${i <= strength ? ` prof-pw-bar--${strength === 1 ? 'weak' : strength === 2 ? 'fair' : strength === 3 ? 'good' : 'strong'}` : ''}`} />;
                  })}
                  <span className="prof-pw-label">
                    {security.newPw.length < 8 ? 'Weak' : /[A-Z]/.test(security.newPw) && /[0-9]/.test(security.newPw) && /[^A-Za-z0-9]/.test(security.newPw) && security.newPw.length >= 12 ? 'Strong' : /[A-Z]/.test(security.newPw) && /[0-9]/.test(security.newPw) ? 'Good' : 'Fair'}
                  </span>
                </div>
              )}
            </Field>
            <Field label="Confirm New Password" error={secErrors.confirmPw}>
              <div className="prof-input-wrap">
                <span className="prof-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  className="prof-input prof-input--icon"
                  type={showPw.confirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={security.confirmPw}
                  onChange={e => setSecurity(s => ({ ...s, confirmPw: e.target.value }))}
                />
                <button type="button" className="prof-eye" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                  <EyeIcon open={showPw.confirm} />
                </button>
              </div>
            </Field>
          </div>

          {/* 2FA */}
          <div className="prof-2fa">
            <div className="prof-2fa__info">
              <div className="prof-2fa__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <p className="prof-2fa__title">Two-Factor Authentication</p>
                <p className="prof-2fa__sub">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <label className="prof-toggle">
              <input type="checkbox" checked={twoFA} onChange={e => { setTwoFA(e.target.checked); showToast(e.target.checked ? '2FA enabled!' : '2FA disabled'); }} />
              <span className="prof-toggle__track" />
            </label>
          </div>

          {/* Active sessions */}
          <div className="prof-sessions">
            <p className="prof-sessions__title">Active Sessions</p>
            {sessions.map(s => (
              <div key={s.id} className="prof-session">
                <div className="prof-session__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                </div>
                <div className="prof-session__info">
                  <p className="prof-session__device">{s.device} {s.current && <span className="prof-session__badge">Current</span>}</p>
                  <p className="prof-session__meta">{s.ip} · {s.time}</p>
                </div>
                {!s.current && (
                  <button className="prof-session__revoke" onClick={() => showToast('Session revoked', 'success')}>Revoke</button>
                )}
              </div>
            ))}
          </div>

          <div className="prof-section__footer">
            <button className="prof-btn prof-btn--danger" onClick={saveSecurity}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Update Password
            </button>
          </div>
        </div>

        {/* ══ PREFERENCES ══ */}
        <div className="prof-section">
          <SectionHead
            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>}
            title="Notifications & Preferences"
            subtitle="Manage how you receive updates and your display preferences."
            color="#f59e0b"
            bg="#fffbeb"
          />

          {/* Notifications */}
          <p className="prof-pref-group-title">Notifications</p>
          <div className="prof-toggles">
            {[
              { key: 'emailNotifs',    label: 'Email Notifications',  sub: 'Receive updates via email' },
              { key: 'pushNotifs',     label: 'Push Notifications',   sub: 'Browser push alerts' },
              { key: 'weeklyReport',   label: 'Weekly Report',        sub: 'Get a summary every Monday' },
              { key: 'productUpdates', label: 'Product Updates',      sub: 'News about new features' },
            ].map(({ key, label, sub }) => (
              <div key={key} className="prof-toggle-row">
                <div>
                  <p className="prof-toggle-label">{label}</p>
                  <p className="prof-toggle-sub">{sub}</p>
                </div>
                <label className="prof-toggle">
                  <input type="checkbox" checked={prefs[key]} onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))} />
                  <span className="prof-toggle__track" />
                </label>
              </div>
            ))}
          </div>

          {/* Display prefs */}
          <p className="prof-pref-group-title" style={{ marginTop: '1.5rem' }}>Display</p>
          <div className="prof-grid">
            <Field label="Language">
              <select className="prof-select" value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="ta">Tamil</option>
              </select>
            </Field>
            <Field label="Date Format">
              <select className="prof-select" value={prefs.dateFormat} onChange={e => setPrefs(p => ({ ...p, dateFormat: e.target.value }))}>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </Field>
            <Field label="Currency">
              <select className="prof-select" value={prefs.currency} onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))}>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="JPY">JPY — Japanese Yen</option>
              </select>
            </Field>
          </div>

          <div className="prof-section__footer">
            <button className="prof-btn prof-btn--ghost">Reset to defaults</button>
            <button className="prof-btn prof-btn--primary" onClick={savePrefs}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Save Preferences
            </button>
          </div>
        </div>

        {/* ══ DANGER ZONE ══ */}
        <div className="prof-section prof-section--danger">
          <SectionHead
            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            title="Danger Zone"
            subtitle="Irreversible actions — please proceed with caution."
            color="#ef4444"
            bg="#fef2f2"
          />
          <div className="prof-danger-actions">
            <div className="prof-danger-item">
              <div>
                <p className="prof-danger-title">Deactivate Account</p>
                <p className="prof-danger-sub">Temporarily disable your account. You can reactivate anytime.</p>
              </div>
              <button className="prof-btn prof-btn--outline-danger" onClick={() => showToast('Account deactivation requires admin approval', 'error')}>
                Deactivate
              </button>
            </div>
            <div className="prof-danger-item">
              <div>
                <p className="prof-danger-title">Delete Account</p>
                <p className="prof-danger-sub">Permanently delete your account and all associated data.</p>
              </div>
              <button className="prof-btn prof-btn--danger" onClick={() => showToast('Account deletion requires admin approval', 'error')}>
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
