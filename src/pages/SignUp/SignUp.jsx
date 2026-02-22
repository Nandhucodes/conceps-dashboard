import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useForm } from '../../hooks/useForm';
import './SignUp.css';

const validate = (values) => {
  const errors = {};
  if (!values.name.trim()) {
    errors.name = 'Full name is required';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[A-Z])/.test(values.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  if (!values.terms) {
    errors.terms = 'You must accept the terms and conditions';
  }
  return errors;
};

function SignUp({ onLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { name: '', email: '', password: '', confirmPassword: '', terms: false },
    validate
  );

  const handleCheckbox = (e) => {
    handleChange({ target: { name: 'terms', value: e.target.checked } });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { label: '', level: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak', level: 1, color: 'var(--color-danger)' };
    if (score <= 3) return { label: 'Medium', level: 2, color: 'var(--color-warning)' };
    return { label: 'Strong', level: 3, color: 'var(--color-success)' };
  };

  const pwStrength = getPasswordStrength(values.password);

  const onSubmit = async (formValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    const pending = {
      name:     formValues.name,
      email:    formValues.email,
      password: formValues.password,
    };

    // Store in sessionStorage AND pass via route state as a double-safe fallback
    sessionStorage.setItem('pending_user', JSON.stringify(pending));
    navigate('/verify-otp', { state: { pending } });
  };

  return (
    <div className="signup animate-fadeIn">
      <div className="signup__head">
        <h1 className="signup__title">Create account</h1>
        <p className="signup__subtitle">Start your free trial today — no credit card required</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="signup__fields">
          <Input
            label="Full name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && errors.name}
            placeholder="John Doe"
            required
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email}
            placeholder="you@example.com"
            required
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
          />

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && errors.password}
              placeholder="Min. 8 characters"
              required
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />
            {values.password && (
              <div className="signup__pw-strength">
                <div className="signup__pw-bars">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className="signup__pw-bar"
                      style={{
                        background: pwStrength.level >= level ? pwStrength.color : 'var(--color-border)',
                      }}
                    />
                  ))}
                </div>
                <span className="signup__pw-label" style={{ color: pwStrength.color }}>
                  {pwStrength.label}
                </span>
              </div>
            )}
          </div>

          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword && errors.confirmPassword}
            placeholder="Repeat your password"
            required
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
          />

          <label className="signup__terms">
            <input type="checkbox" onChange={handleCheckbox} checked={values.terms} />
            <span>
              I agree to the{' '}
              <Link to="#" className="signup__link">Terms of Service</Link>{' '}
              and{' '}
              <Link to="#" className="signup__link">Privacy Policy</Link>
            </span>
          </label>
          {touched.terms && errors.terms && (
            <span className="signup__terms-error">{errors.terms}</span>
          )}
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Create Account
        </Button>
      </form>

      <p className="signup__signin">
        Already have an account?{' '}
        <Link to="/signin" className="signup__signin-link">Sign in</Link>
      </p>
    </div>
  );
}

export default SignUp;
