import { useState, useMemo } from 'react';
import Card from '../../components/Card/Card';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Pagination from '../../components/Pagination/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { mockUsers } from '../../data/users';
import './ListPage.css';

const ITEMS_PER_PAGE = 6;

function ListPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);

  const roles = ['All', ...new Set(mockUsers.map((u) => u.role))];
  const statuses = ['All', 'Active', 'Inactive'];

  const filtered = useMemo(() => {
    let data = [...mockUsers];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'All') data = data.filter((u) => u.role === roleFilter);
    if (statusFilter !== 'All') data = data.filter((u) => u.status === statusFilter);
    data.sort((a, b) => {
      const valA = a[sortBy]?.toLowerCase?.() ?? a[sortBy];
      const valB = b[sortBy]?.toLowerCase?.() ?? b[sortBy];
      return sortDir === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
    return data;
  }, [search, roleFilter, statusFilter, sortBy, sortDir]);

  const { paginatedData, currentPage, totalPages, goToPage, hasNext, hasPrev } = usePagination(
    filtered,
    ITEMS_PER_PAGE
  );

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortDir('asc'); }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const pageIds = paginatedData.map((u) => u.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const pageIds = paginatedData.map((u) => u.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const SortIcon = ({ field }) => (
    <span className={`list__sort-icon ${sortBy === field ? 'list__sort-icon--active' : ''}`}>
      {sortBy === field && sortDir === 'desc' ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      )}
    </span>
  );

  return (
    <div className="list-page animate-fadeIn">
      <div className="list-page__header">
        <div>
          <h1 className="list-page__title">Users</h1>
          <p className="list-page__subtitle">{filtered.length} users found</p>
        </div>
        <Button icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        }>
          Add User
        </Button>
      </div>

      <Card padding="md" className="list-page__filters">
        <div className="list-filters">
          <div className="list-filters__search-wrapper">
            <span className="list-filters__search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, email or department…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
              className="list-filters__search"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); goToPage(1); }}
            className="list-filters__select"
          >
            {roles.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); goToPage(1); }}
            className="list-filters__select"
          >
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          {(search || roleFilter !== 'All' || statusFilter !== 'All') && (
            <button
              className="list-filters__clear"
              onClick={() => { setSearch(''); setRoleFilter('All'); setStatusFilter('All'); goToPage(1); }}
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      {selectedIds.length > 0 && (
        <div className="list-page__bulk-actions">
          <span>{selectedIds.length} user(s) selected</span>
          <Button variant="danger" size="sm" onClick={() => setSelectedIds([])}>
            Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            Deselect All
          </Button>
        </div>
      )}

      <Card padding="none">
        <div className="list-table-wrapper">
          <table className="list-table">
            <thead>
              <tr>
                <th className="list-table__check">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    aria-label="Select all on this page"
                  />
                </th>
                <th onClick={() => toggleSort('name')} className="list-table__sortable">
                  User <SortIcon field="name" />
                </th>
                <th onClick={() => toggleSort('role')} className="list-table__sortable">
                  Role <SortIcon field="role" />
                </th>
                <th onClick={() => toggleSort('department')} className="list-table__sortable">
                  Department <SortIcon field="department" />
                </th>
                <th onClick={() => toggleSort('status')} className="list-table__sortable">
                  Status <SortIcon field="status" />
                </th>
                <th onClick={() => toggleSort('joined')} className="list-table__sortable">
                  Joined <SortIcon field="joined" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="list-table__empty">
                    <div className="list-table__empty-content">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p>No users found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((user) => (
                  <tr key={user.id} className={selectedIds.includes(user.id) ? 'list-table__row--selected' : ''}>
                    <td className="list-table__check">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                    </td>
                    <td>
                      <div className="list-user">
                        <div className="list-user__avatar">{user.avatar}</div>
                        <div>
                          <p className="list-user__name">{user.name}</p>
                          <p className="list-user__email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant="primary">{user.role}</Badge>
                    </td>
                    <td className="list-table__dept">{user.department}</td>
                    <td>
                      <Badge variant={user.status === 'Active' ? 'success' : 'default'} dot>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="list-table__date">
                      {new Date(user.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <div className="list-actions">
                        <button className="list-actions__btn" title="Edit user">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="list-actions__btn list-actions__btn--danger" title="Delete user">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="list-page__footer">
        <p className="list-page__count">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          hasNext={hasNext}
          hasPrev={hasPrev}
        />
      </div>
    </div>
  );
}

export default ListPage;
