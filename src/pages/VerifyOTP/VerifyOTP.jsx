import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './VerifyOTP.css';

const OTP_LENGTH = 6;

/* mask email: john@example.com → j***@example.com */
function maskEmail(email = '') {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return local[0] + '***@' + domain;
}

export default function VerifyOTP({ onRegister }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [otp, setOtp]            = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState('');
  const [success, setSuccess]    = useState(false);
  const [resendTimer, setResend] = useState(30);
  const [resendLoading, setRL]   = useState(false);
  const [resendDone, setRD]      = useState(false);
  const [shake, setShake]        = useState(false);
  const inputsRef = useRef([]);

  /* Read pending user from route state (primary) or sessionStorage (fallback) */
  const pendingUser = location.state?.pending
    || JSON.parse(sessionStorage.getItem('pending_user') || '{}');
  const email = pendingUser.email || '';
  const name  = pendingUser.name  || '';

  /* auto-focus first box */
  useEffect(() => { inputsRef.current[0]?.focus(); }, []);

  /* resend countdown */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResend(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* ── Input handlers ── */
  const handleChange = (idx, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw && e.nativeEvent.inputType !== 'deleteContentBackward') return;

    const next = [...otp];

    if (raw.length > 1) {
      /* paste / autofill */
      raw.slice(0, OTP_LENGTH).split('').forEach((d, i) => {
        if (idx + i < OTP_LENGTH) next[idx + i] = d;
      });
      setOtp(next);
      const jump = Math.min(idx + raw.length, OTP_LENGTH - 1);
      inputsRef.current[jump]?.focus();
      return;
    }

    next[idx] = raw;
    setOtp(next);
    setError('');
    if (raw && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (!otp[idx] && idx > 0) {
        const next = [...otp]; next[idx - 1] = '';
        setOtp(next);
        inputsRef.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft'  && idx > 0)            inputsRef.current[idx - 1]?.focus();
      else if (e.key === 'ArrowRight' && idx < OTP_LENGTH-1) inputsRef.current[idx + 1]?.focus();
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please fill in all 6 digits.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);

    /* Accept any 6-digit code (demo) */
    if (code.length === OTP_LENGTH) {
      // Register the account now that OTP is verified
      if (pendingUser.email) {
        if (onRegister) {
          onRegister({
            name:     pendingUser.name,
            email:    pendingUser.email,
            password: pendingUser.password,
          });
        }
        sessionStorage.removeItem('pending_user');
      }
      setSuccess(true);
      await new Promise(r => setTimeout(r, 1800));
      // Redirect to Sign In — user signs in with their new credentials
      navigate('/signin', {
        state: { verified: true, email: pendingUser.email },
        replace: true,
      });
    } else {
      setError('Invalid code. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      setShake(true);
      setTimeout(() => setShake(false), 600);
      inputsRef.current[0]?.focus();
    }
  };

  /* ── Auto-fill demo code ── */
  const fillDemo = () => {
    const demo = ['1','2','3','4','5','6'];
    setOtp(demo);
    setError('');
    inputsRef.current[OTP_LENGTH - 1]?.focus();
  };

  /* ── Resend ── */
  const handleResend = async () => {
    setRL(true);
    await new Promise(r => setTimeout(r, 1000));
    setRL(false);
    setRD(true);
    setResend(30);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    inputsRef.current[0]?.focus();
    setTimeout(() => setRD(false), 3000);
  };

  const filled = otp.filter(Boolean).length;

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="otp animate-fadeIn">
        <div className="otp__success-wrap">
          <div className="otp__success-ring">
            <div className="otp__success-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <h2 className="otp__success-title">Email Verified!</h2>
          <p className="otp__success-sub">Your account is ready. Redirecting to Sign In…</p>
          <div className="otp__success-dots">
            <span/><span/><span/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="otp animate-fadeIn">

      {/* ── Icon ── */}
      <div className="otp__icon-wrap">
        <div className="otp__icon-ring otp__icon-ring--1"/>
        <div className="otp__icon-ring otp__icon-ring--2"/>
        <div className="otp__icon-circle">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="otp__head">
        {name && <p className="otp__greeting">Hi, <strong>{name}</strong>! 👋</p>}
        <h1 className="otp__title">Verify your email</h1>
        <p className="otp__sub">We sent a 6-digit verification code to</p>
        <div className="otp__email-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          {maskEmail(email)}
        </div>
      </div>

      {/* ── Demo hint card ── */}
      <div className="otp__demo-card">
        <div className="otp__demo-card-left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="otp__demo-card-title">Demo mode — no real email sent</p>
            <p className="otp__demo-card-sub">Use code <strong>1 2 3 4 5 6</strong> or click the button →</p>
          </div>
        </div>
        <button type="button" className="otp__demo-fill-btn" onClick={fillDemo}>
          Use 123456
        </button>
      </div>

      {/* ── Progress dots ── */}
      <div className="otp__progress">
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <div key={i} className={`otp__dot${i < filled ? ' otp__dot--filled' : ''}${i === filled ? ' otp__dot--active' : ''}`}/>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="otp__error" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* ── Resend done toast ── */}
      {resendDone && (
        <div className="otp__resend-toast animate-slideInRight">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          New code sent to your email!
        </div>
      )}

      {/* ── OTP inputs ── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className={`otp__boxes${shake ? ' otp__boxes--shake' : ''}`} role="group" aria-label="OTP input">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={digit}
              onChange={e => handleChange(i, e)}
              onKeyDown={e => handleKeyDown(i, e)}
              onFocus={e => e.target.select()}
              className={`otp__box${error ? ' otp__box--error' : ''}${digit ? ' otp__box--filled' : ''}${!error && i === filled && filled < OTP_LENGTH ? ' otp__box--active' : ''}`}
              aria-label={`Digit ${i + 1}`}
              autoComplete="off"
            />
          ))}
        </div>

        {/* ── Submit button ── */}
        <button
          type="submit"
          className={`otp__submit${filled === OTP_LENGTH ? ' otp__submit--ready' : ''}`}
          disabled={loading || filled < OTP_LENGTH}
        >
          {loading ? (
            <>
              <span className="otp__spinner"/>
              Verifying…
            </>
          ) : (
            <>
              Verify Email
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </>
          )}
        </button>
      </form>

      {/* ── Resend ── */}
      <div className="otp__resend">
        {resendTimer > 0 ? (
          <p className="otp__resend-timer">
            Resend code in <span className="otp__resend-count">{resendTimer}s</span>
          </p>
        ) : (
          <button type="button" className="otp__resend-btn" onClick={handleResend} disabled={resendLoading}>
            {resendLoading ? (
              <><span className="otp__spinner otp__spinner--sm"/>Sending…</>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                Resend Code
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Back link ── */}
      <div className="otp__footer">
        <Link to="/signin" className="otp__back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Sign In
        </Link>
      </div>

    </div>
  );
}
