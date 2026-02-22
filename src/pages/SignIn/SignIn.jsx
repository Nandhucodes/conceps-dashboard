import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import './SignIn.css';

const validate = (values) => {
  const errors = {};
  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
};

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function SignIn({ onLogin }) {
  const navigate       = useNavigate();
  const location       = useLocation();
  const [searchParams] = useSearchParams();
  // Support both URL param (?verified=1) and route state ({ verified: true })
  const justVerified   = searchParams.get('verified') === '1' || location.state?.verified === true;
  const verifiedEmail  = location.state?.email || '';
  const [loading, setLoading]     = useState(false);
  const [socialLoad, setSocial]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [authError, setAuthError] = useState('');
  const [remember, setRemember]   = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { email: verifiedEmail, password: '' },
    validate
  );

  // Pre-fill email from verified account
  useEffect(() => {
    if (verifiedEmail) {
      handleChange({ target: { name: 'email', value: verifiedEmail } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (v) => {
    setLoading(true); setAuthError('');
    await new Promise(r => setTimeout(r, 1300));
    setLoading(false);
    const result = onLogin({ email: v.email, password: v.password });
    if (result && result.success === false) {
      setAuthError(result.error);
      return;
    }
    navigate('/dashboard');
  };

  const handleSocial = async (provider) => {
    setSocial(provider);
    await new Promise(r => setTimeout(r, 1400));
    setSocial('');
    onLogin({ email: `user@${provider}.com`, name: `${provider[0].toUpperCase() + provider.slice(1)} User` });
    navigate('/dashboard');
  };

  const fillDemo = () => {
    handleChange({ target: { name: 'email',    value: 'admin@example.com' } });
    handleChange({ target: { name: 'password', value: 'admin123' } });
  };

  return (
    <div className="si animate-fadeIn">

      {/* ── Logo row ── */}
      <div className="si__logo">
        <div className="si__logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <span className="si__logo-name">Conceps</span>
      </div>

      {/* ── Heading ── */}
      <div className="si__head">
        <h1 className="si__title">Sign in to your account</h1>
        <p className="si__sub">Welcome back! Please enter your details.</p>
      </div>

      {/* ── Social ── */}
      <div className="si__social-row">
        <button
          type="button"
          className={`si__social si__social--google${socialLoad === 'google' ? ' si__social--busy' : ''}`}
          onClick={() => handleSocial('google')}
          disabled={!!socialLoad || loading}
        >
          {socialLoad === 'google'
            ? <span className="si__spin si__spin--dark" />
            : <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
          }
          <span>Google</span>
        </button>

        <button
          type="button"
          className={`si__social si__social--apple${socialLoad === 'apple' ? ' si__social--busy' : ''}`}
          onClick={() => handleSocial('apple')}
          disabled={!!socialLoad || loading}
        >
          {socialLoad === 'apple'
            ? <span className="si__spin si__spin--white" />
            : <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.77M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
          }
          <span>Apple</span>
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="si__divider"><span>or continue with email</span></div>

      {/* ── Account verified banner ── */}
      {justVerified && (
        <div className="si__verified-banner">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <div>
            <p className="si__verified-title">Account verified! 🎉</p>
            <p className="si__verified-sub">Sign in below with your email and password to continue.</p>
          </div>
        </div>
      )}

      {authError && (
        <div className="si__error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {authError}
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="si__form">

        {/* Email field */}
        <div className={`si__field${touched.email && errors.email ? ' si__field--error' : ''}${values.email ? ' si__field--filled' : ''}`}>
          <label className="si__label" htmlFor="si-email">Email address</label>
          <div className="si__input-wrap">
            <span className="si__field-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input
              id="si-email"
              name="email"
              type="email"
              className="si__input"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
            />
          </div>
          {touched.email && errors.email && <p className="si__field-err">{errors.email}</p>}
        </div>

        {/* Password field */}
        <div className={`si__field${touched.password && errors.password ? ' si__field--error' : ''}${values.password ? ' si__field--filled' : ''}`}>
          <div className="si__label-row">
            <label className="si__label" htmlFor="si-pw">Password</label>
            <Link to="/forgot-password" className="si__forgot-inline">Forgot password?</Link>
          </div>
          <div className="si__input-wrap">
            <span className="si__field-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              id="si-pw"
              name="password"
              type={showPw ? 'text' : 'password'}
              className="si__input"
              placeholder="Min. 6 characters"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
            />
            <button type="button" className="si__eye" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
              <EyeIcon open={showPw} />
            </button>
          </div>
          {touched.password && errors.password && <p className="si__field-err">{errors.password}</p>}
        </div>

        {/* Remember me + demo */}
        <div className="si__meta">
          <label className="si__remember">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <span className="si__remember-box">
              {remember && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </span>
            <span>Remember for 30 days</span>
          </label>
          <button type="button" className="si__demo-pill" onClick={fillDemo}>
            ⚡ Demo
          </button>
        </div>

        {/* Submit */}
        <button type="submit" className={`si__submit${loading ? ' si__submit--busy' : ''}`} disabled={loading || !!socialLoad}>
          {loading ? (
            <><span className="si__spin si__spin--white" /> Signing in…</>
          ) : (
            <>
              Sign In
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </>
          )}
        </button>
      </form>

      {/* ── Trust strip ── */}
      <div className="si__trust">
        {[
          { icon: '🔒', text: '256-bit SSL' },
          { icon: '✅', text: 'GDPR Ready' },
          { icon: '🛡️', text: '2FA Support' },
        ].map((t, i) => (
          <span key={i} className="si__trust-chip">{t.icon} {t.text}</span>
        ))}
      </div>

      {/* ── Signup link ── */}
      <p className="si__signup">
        Don't have an account?{' '}
        <Link to="/signup" className="si__signup-link">Create one free →</Link>
      </p>

      {/* ── OTP test shortcut ── */}
      <div className="si__otp-shortcut">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
        Want to test OTP?{' '}
        <Link to="/verify-otp" className="si__otp-link">Open OTP Verification →</Link>
      </div>
    </div>
  );
}

export default SignIn;
