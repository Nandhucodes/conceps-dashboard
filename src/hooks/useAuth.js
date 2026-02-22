import { useState } from 'react';

/* ─────────────────────────────────────────────────
   Registered accounts are stored in localStorage
   as an array under the key "registered_accounts".
   Each entry: { name, email, password, avatar, role }
   This simulates a real backend user store.
───────────────────────────────────────────────── */
const ACCOUNTS_KEY = 'registered_accounts';
const SESSION_KEY  = 'user';

function getAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); }
  catch { return []; }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function makeInitials(name = '') {
  return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AU';
}

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem(SESSION_KEY)
  );

  /* ── Register: called after OTP is verified ── */
  const register = ({ name, email, password }) => {
    const accounts = getAccounts();
    // Prevent duplicate accounts
    const exists = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, error: 'An account with this email already exists.' };

    const newAccount = {
      name,
      email,
      password,
      role:   'Member',
      avatar: makeInitials(name),
    };
    saveAccounts([...accounts, newAccount]);
    return { success: true };
  };

  /* ── Login: validate credentials against accounts store ── */
  const login = ({ email, password, name }) => {
    const accounts = getAccounts();
    const account  = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

    // If no accounts registered yet (demo/admin mode), allow any login
    if (accounts.length === 0) {
      const userInfo = {
        name:   name || 'Admin User',
        email,
        role:   'Admin',
        avatar: makeInitials(name || 'Admin User'),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
      setUser(userInfo);
      setIsAuthenticated(true);
      return { success: true };
    }

    // Validate against registered accounts
    if (!account) {
      return { success: false, error: 'No account found with this email. Please sign up first.' };
    }
    if (account.password && password && account.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const userInfo = {
      name:   account.name,
      email:  account.email,
      role:   account.role || 'Member',
      avatar: makeInitials(account.name),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
    setUser(userInfo);
    setIsAuthenticated(true);
    return { success: true };
  };

  /* ── Logout ── */
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, login, logout, register };
}
