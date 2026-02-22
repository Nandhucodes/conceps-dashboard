import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Pagination from '../../components/Pagination/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { mockUsers } from '../../data/users';
import './UsersPage.css';

const ITEMS_PER_PAGE = 8;
const ROLES       = ['All', 'Admin', 'Manager', 'Developer', 'Designer', 'Analyst'];
const STATUSES    = ['All', 'Active', 'Inactive'];
const DEPARTMENTS = ['Engineering', 'Sales', 'Design', 'Marketing', 'Analytics', 'HR', 'Finance', 'IT'];

const AVATAR_PALETTE = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b',
  '#10b981','#3b82f6','#ef4444','#14b8a6',
  '#f97316','#06b6d4','#84cc16','#a855f7',
];
// Hash full name for more unique colors
const avatarColor = (name) => {
  if (!name) return '#6366f1';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};
const makeAvatar = (name) => name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

const ROLE_STYLES = {
  Admin:     { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  Manager:   { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe' },
  Developer: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  Designer:  { bg: '#fce7f3', color: '#9d174d', border: '#fbcfe8' },
  Analyst:   { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
  default:   { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' },
};
const roleStyle = (role) => ROLE_STYLES[role] || ROLE_STYLES.default;

const statusVariant = { Active: 'success', Inactive: 'default' };
const emptyForm = { name:'', email:'', role:'Developer', status:'Active', department:'Engineering', phone:'' };

/* ══════════════════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════════════════ */
function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-item--${t.type} animate-slideInRight`}>
          <span className="toast-item__icon">
            {t.type === 'success' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            {t.type === 'error'   && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
            {t.type === 'warning' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          </span>
          <p className="toast-item__msg">{t.msg}</p>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);
  return { toasts, show };
}

/* ══════════════════════════════════════════════════
   DELETE CONFIRM DIALOG
══════════════════════════════════════════════════ */
function DeleteConfirm({ user, onCancel, onConfirm }) {
  const overlayRef = useRef(null);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = e => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', h); };
  }, [onCancel]);

  return (
    <div className="uf-overlay animate-fadeIn" ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onCancel(); }}>
      <div className="dc animate-fadeInScale" role="dialog" aria-modal="true">
        <div className="dc__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 className="dc__title">Delete User</h3>
        <p className="dc__desc">
          Are you sure you want to delete <strong>{user.name}</strong>?<br/>
          This action cannot be undone.
        </p>
        <div className="dc__footer">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Yes, Delete</Button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ADD / EDIT USER SLIDE PANEL
══════════════════════════════════════════════════ */
function UserFormPanel({ user, onClose, onSave }) {
  const [form, setForm]     = useState(user ? { ...user } : { ...emptyForm });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!user;

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600)); // simulate async
    onSave({
      ...form,
      id:     user?.id || Date.now(),
      avatar: makeAvatar(form.name),
      joined: user?.joined || new Date().toISOString().split('T')[0],
    });
    setSaving(false);
    onClose();
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div className="uf__field">
      <label className="uf__label">{label} {['name','email'].includes(key) && <span style={{color:'var(--color-danger)'}}>*</span>}</label>
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        autoComplete="off"
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(err => ({ ...err, [key]: '' })); }}
        className={`uf__input${errors[key] ? ' uf__input--error' : ''}`}
      />
      {errors[key] && <p className="uf__error">{errors[key]}</p>}
    </div>
  );

  const select = (label, key, opts) => (
    <div className="uf__field">
      <label className="uf__label">{label}</label>
      <select className="uf__select" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div className="fp-overlay animate-fadeIn" onClick={onClose} />

      {/* Slide panel */}
      <div className="fp animate-slideInRight" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit User' : 'Add User'}>
        {/* Header */}
        <div className="fp__header">
          <div className="fp__header-left">
            {form.name ? (
              <div className="fp__avatar-sm" style={{ background: avatarColor(form.name) }}>{makeAvatar(form.name)}</div>
            ) : (
              <div className="fp__avatar-sm fp__avatar-sm--empty">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            )}
            <div>
              <h2 className="fp__title">{isEdit ? 'Edit User' : 'Add New User'}</h2>
              <p className="fp__subtitle">{isEdit ? `Editing ${user.name}` : 'Fill in the details below'}</p>
            </div>
          </div>
          <button className="uf__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form body */}
        <form className="fp__body" onSubmit={handleSubmit} noValidate>
          <div className="fp__section-label">Personal Information</div>
          {field('Full Name',  'name',  'text',  'e.g. John Doe')}
          {field('Email Address', 'email', 'email', 'e.g. john@example.com')}
          {field('Phone Number',  'phone', 'tel',   '+1 (555) 000-0000')}

          <div className="fp__section-label" style={{ marginTop: '1.25rem' }}>Role & Access</div>
          <div className="uf__grid">
            {select('Role',       'role',       ROLES.slice(1))}
            {select('Status',     'status',     STATUSES.slice(1))}
          </div>
          {select('Department', 'department', DEPARTMENTS)}
        </form>

        {/* Footer */}
        <div className="fp__footer">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>
            {saving ? (isEdit ? 'Saving…' : 'Adding…') : (isEdit ? 'Save Changes' : 'Add User')}
          </Button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   USER DETAIL POPUP
══════════════════════════════════════════════════ */
function UserDetailModal({ user, onClose, onEdit, onDelete }) {
  const overlayRef = useRef(null);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', h); };
  }, [onClose]);

  return (
    <div className="uf-overlay animate-fadeIn" ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="udm animate-fadeInScale" role="dialog" aria-modal="true">
        <div className="udm__header">
          <h2 className="uf__title">User Profile</h2>
          <button className="uf__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="udm__body">
          <div className="udm__avatar-wrap">
            <div className="udm__avatar" style={{ background: avatarColor(user.name) }}>{user.avatar}</div>
            <div>
              <h3 className="udm__name">{user.name}</h3>
              <p className="udm__email">{user.email}</p>
            </div>
            <Badge variant={statusVariant[user.status]} dot>{user.status}</Badge>
          </div>
          <table className="pm__table" style={{ marginTop: '1rem' }}>
            <tbody>
              <tr><td>Role</td><td><strong>{user.role}</strong></td></tr>
              <tr><td>Department</td><td>{user.department}</td></tr>
              <tr><td>Phone</td><td>{user.phone || '—'}</td></tr>
              <tr><td>Joined</td><td>{user.joined ? new Date(user.joined).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '—'}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="udm__footer">
          <button className="udm__delete-btn" onClick={() => { onDelete(user); onClose(); }}>Delete</button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={() => { onClose(); onEdit(user); }}>Edit</Button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
function UsersPage() {
  const [users, setUsers]         = useState(mockUsers);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('All');
  const [statusFilter, setStatus] = useState('All');
  const [addOpen, setAddOpen]     = useState(false);
  const [editUser, setEditUser]   = useState(null);
  const [viewUser, setViewUser]   = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [selected, setSelected]   = useState(new Set());
  const { toasts, show }          = useToast();

  const filtered = useMemo(() => {
    let data = [...users];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'All')   data = data.filter(u => u.role === roleFilter);
    if (statusFilter !== 'All') data = data.filter(u => u.status === statusFilter);
    return data;
  }, [users, search, roleFilter, statusFilter]);

  const { paginatedData, currentPage, totalPages, goToPage, hasNext, hasPrev } = usePagination(filtered, ITEMS_PER_PAGE);

  const handleSave = (saved) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === saved.id);
      if (idx >= 0) {
        const next = [...prev]; next[idx] = saved; return next;
      }
      return [saved, ...prev];
    });
    const isNew = !users.find(u => u.id === saved.id);
    show(isNew ? `✓ ${saved.name} has been added successfully!` : `✓ ${saved.name} updated successfully!`, 'success');
  };

  const confirmDelete = (user) => setDeleteUser(user);

  const handleDelete = () => {
    if (!deleteUser) return;
    setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
    setSelected(prev => { const n = new Set(prev); n.delete(deleteUser.id); return n; });
    show(`${deleteUser.name} has been deleted.`, 'warning');
    setDeleteUser(null);
  };

  const toggleSelect = (id) => setSelected(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const allChecked = paginatedData.length > 0 && paginatedData.every(u => selected.has(u.id));
  const toggleAll  = () => {
    if (allChecked) setSelected(prev => { const n = new Set(prev); paginatedData.forEach(u => n.delete(u.id)); return n; });
    else            setSelected(prev => { const n = new Set(prev); paginatedData.forEach(u => n.add(u.id)); return n; });
  };

  const bulkDelete = () => {
    const count = selected.size;
    setUsers(prev => prev.filter(u => !selected.has(u.id)));
    setSelected(new Set());
    show(`${count} user${count > 1 ? 's' : ''} deleted.`, 'warning');
  };

  return (
    <>
      <Toast toasts={toasts} />

      <div className="up animate-fadeIn">
        {/* Header */}
        <div className="up__header">
          <div>
            <h1 className="up__title">Users</h1>
            <p className="up__subtitle">{filtered.length} members · {users.filter(u => u.status === 'Active').length} active</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '0.375rem' }}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add User
          </Button>
        </div>

        {/* Toolbar */}
        <div className="up__toolbar">
          <div className="up__search-wrap">
            <span className="up__search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input type="text" placeholder="Search users…" value={search}
              onChange={e => { setSearch(e.target.value); goToPage(1); }}
              className="up__search" />
          </div>
          <select className="up__select" value={roleFilter} onChange={e => { setRole(e.target.value); goToPage(1); }}>
            {ROLES.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
          </select>
          <select className="up__select" value={statusFilter} onChange={e => { setStatus(e.target.value); goToPage(1); }}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
          </select>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="up__bulk-bar animate-fadeIn">
            <span>{selected.size} user{selected.size > 1 ? 's' : ''} selected</span>
            <button className="up__bulk-delete" onClick={bulkDelete}>Delete Selected</button>
            <button className="up__bulk-clear" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="up__table-wrap">
          <table className="up__table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={allChecked} onChange={toggleAll} className="up__checkbox"/></th>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="up__empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p>No users found</p>
                    <button className="up__empty-add" onClick={() => setAddOpen(true)}>+ Add your first user</button>
                  </div>
                </td></tr>
              ) : paginatedData.map((user, i) => (
                <tr key={user.id}
                  className={`up__tr${selected.has(user.id) ? ' up__tr--selected' : ''}`}
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td><input type="checkbox" checked={selected.has(user.id)} onChange={() => toggleSelect(user.id)} className="up__checkbox"/></td>
                  <td>
                    <div className="up__user-cell" onClick={() => setViewUser(user)} style={{ cursor: 'pointer' }}>
                      <div className="up__avatar" style={{ background: avatarColor(user.name) }}>{user.avatar}</div>
                      <div>
                        <p className="up__user-name">{user.name}</p>
                        <p className="up__user-email">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="up__role-chip" style={{
                      background: roleStyle(user.role).bg,
                      color: roleStyle(user.role).color,
                      border: `1px solid ${roleStyle(user.role).border}`,
                    }}>{user.role}</span>
                  </td>
                  <td className="up__dept">{user.department}</td>
                  <td><Badge variant={statusVariant[user.status]} dot>{user.status}</Badge></td>
                  <td className="up__joined">
                    {user.joined ? new Date(user.joined).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—'}
                  </td>
                  <td>
                    <div className="up__actions">
                      <button className="up__action-btn up__action-btn--edit" title="Edit user" onClick={() => setEditUser(user)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="up__action-btn up__action-btn--danger" title="Delete user" onClick={() => confirmDelete(user)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="up__footer">
          <p className="up__count">
            Showing {Math.min((currentPage-1)*ITEMS_PER_PAGE+1, filtered.length)}–{Math.min(currentPage*ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} hasNext={hasNext} hasPrev={hasPrev}/>
        </div>
      </div>

      {/* Add User slide panel */}
      {addOpen  && <UserFormPanel onClose={() => setAddOpen(false)} onSave={handleSave}/>}

      {/* Edit User slide panel */}
      {editUser && <UserFormPanel user={editUser} onClose={() => setEditUser(null)} onSave={handleSave}/>}

      {/* View User popup */}
      {viewUser && (
        <UserDetailModal
          user={viewUser}
          onClose={() => setViewUser(null)}
          onEdit={u => { setViewUser(null); setEditUser(u); }}
          onDelete={u => { setViewUser(null); confirmDelete(u); }}
        />
      )}

      {/* Delete confirm */}
      {deleteUser && <DeleteConfirm user={deleteUser} onCancel={() => setDeleteUser(null)} onConfirm={handleDelete}/>}
    </>
  );
}

export default UsersPage;
