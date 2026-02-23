import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [step, setStep]         = useState('email'); // 'email' | 'sent'
  const [email, setEmail]       = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [loading, setLoading]   = useState(false);

  const validateEmail = (val) => {
    if (!val.trim()) return 'Email address is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailErr(err); return; }
    setEmailErr('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setLoading(false);
    setStep('sent');
  };

  const handleResend = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
  };

  return (
    <div className="fp animate-fadeIn">
      {step === 'email' ? (
        <>
          {/* Icon */}
          <div className="fp__icon-wrap">
            <div className="fp__icon-ring fp__icon-ring--1" />
            <div className="fp__icon-ring fp__icon-ring--2" />
            <div className="fp__icon-circle">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>

          {/* Head */}
          <div className="fp__head">
            <h1 className="fp__title">Forgot your password?</h1>
            <p className="fp__subtitle">
              No worries! Enter your registered email address and we'll send you
              a secure link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="fp__field-wrap">
              <label className="fp__label" htmlFor="fp-email">
                Email address
                <span className="fp__required">*</span>
              </label>
              <div className={`fp__input-wrap${emailErr ? ' fp__input-wrap--error' : ''}`}>
                <span className="fp__input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="fp-email"
                  type="email"
                  className="fp__input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
                  onBlur={() => setEmailErr(validateEmail(email))}
                  autoComplete="email"
                />
              </div>
              {emailErr && (
                <p className="fp__field-error">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {emailErr}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`fp__submit-btn${loading ? ' fp__submit-btn--loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="fp__btn-spinner" />
                  Sending reset link…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Info box */}
          <div className="fp__info">
            <div className="fp__info-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p>Check your spam folder if you don't see the email within a few minutes.</p>
          </div>

          <div className="fp__back">
            <Link to="/signin" className="fp__back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to Sign In
            </Link>
          </div>
        </>
      ) : (
        /* ── Success state ── */
        <div className="fp-success animate-fadeIn">
          <div className="fp-success__anim">
            <div className="fp-success__circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="fp-success__ring" />
          </div>

          <h2 className="fp-success__title">Email sent!</h2>
          <p className="fp-success__desc">
            We've sent a password reset link to
          </p>
          <div className="fp-success__email">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            {email}
          </div>

          <div className="fp-success__steps">
            {[
              { n: '1', text: 'Open the email in your inbox' },
              { n: '2', text: 'Click "Reset Password" button' },
              { n: '3', text: 'Create a new strong password' },
            ].map((s) => (
              <div key={s.n} className="fp-success__step">
                <div className="fp-success__step-num">{s.n}</div>
                <p className="fp-success__step-text">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="fp-success__actions">
            <button
              className={`fp__submit-btn${loading ? ' fp__submit-btn--loading' : ''}`}
              onClick={handleResend}
              disabled={loading}
            >
              {loading ? (
                <><span className="fp__btn-spinner"/> Resending…</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                  </svg>
                  Resend Email
                </>
              )}
            </button>

            <Link to="/signin" className="fp-success__back-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Return to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
