import { useState } from 'react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import { useForm } from '../../hooks/useForm';
import './Registration.css';

const validate = (values) => {
  const errors = {};
  if (!values.firstName.trim()) errors.firstName = 'First name is required';
  if (!values.lastName.trim()) errors.lastName = 'Last name is required';
  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\+?[\d\s\-().]{7,}$/.test(values.phone)) {
    errors.phone = 'Enter a valid phone number';
  }
  if (!values.dob) errors.dob = 'Date of birth is required';
  if (!values.gender) errors.gender = 'Please select a gender';
  if (!values.department.trim()) errors.department = 'Department is required';
  if (!values.role.trim()) errors.role = 'Role is required';
  if (!values.address.trim()) errors.address = 'Address is required';
  if (!values.city.trim()) errors.city = 'City is required';
  if (!values.country.trim()) errors.country = 'Country is required';
  if (!values.bio.trim()) {
    errors.bio = 'Bio is required';
  } else if (values.bio.trim().length < 20) {
    errors.bio = 'Bio must be at least 20 characters';
  }
  return errors;
};

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  department: '',
  role: '',
  address: '',
  city: '',
  country: '',
  bio: '',
  newsletter: false,
  notifications: true,
};

function Registration() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, reset } = useForm(
    initialValues,
    validate
  );

  const handleCheckbox = (name) => (e) => {
    handleChange({ target: { name, value: e.target.checked } });
  };

  const handleSelect = (e) => {
    handleChange(e);
    handleBlur(e);
  };

  const onSubmit = async (formValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="registration animate-fadeIn">
        <div className="registration__success">
          <div className="registration__success-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Registration Successful!</h2>
          <p>Your profile has been registered successfully.</p>
          <Button onClick={() => { setSubmitted(false); reset(); }}>Register Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration animate-fadeIn">

      {/* Page header */}
      <div className="registration__header">
        <div className="registration__header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <div className="registration__header-text">
          <h1 className="registration__title">Registration Form</h1>
          <p className="registration__subtitle">Fill in the details below to register a new user profile.</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="registration__steps">
        <div className="registration__step registration__step--active">
          <div className="registration__step-num">1</div>
          <span className="registration__step-label">Personal</span>
        </div>
        <div className="registration__step-line" />
        <div className="registration__step registration__step--active">
          <div className="registration__step-num">2</div>
          <span className="registration__step-label">Work</span>
        </div>
        <div className="registration__step-line" />
        <div className="registration__step registration__step--active">
          <div className="registration__step-num">3</div>
          <span className="registration__step-label">Address</span>
        </div>
        <div className="registration__step-line" />
        <div className="registration__step registration__step--active">
          <div className="registration__step-num">4</div>
          <span className="registration__step-label">Preferences</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Personal Info */}
        <Card className="registration__section">
          <div className="registration__section-head">
            <div className="registration__section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="registration__section-title">Personal Information</h2>
          </div>
          <div className="registration__grid">
            <Input
              label="First name"
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.firstName && errors.firstName}
              placeholder="John"
              required
            />
            <Input
              label="Last name"
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lastName && errors.lastName}
              placeholder="Doe"
              required
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
              placeholder="john@example.com"
              required
            />
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone && errors.phone}
              placeholder="+1 (555) 000-0000"
              required
            />
            <Input
              label="Date of birth"
              name="dob"
              type="date"
              value={values.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.dob && errors.dob}
              required
            />
            <div className="input-group">
              <label className="input-label" htmlFor="gender">
                Gender <span className="input-required" aria-hidden="true"> *</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={values.gender}
                onChange={handleSelect}
                className={`registration__select ${touched.gender && errors.gender ? 'registration__select--error' : ''}`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
              {touched.gender && errors.gender && (
                <span className="input-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {errors.gender}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Work Info */}
        <Card className="registration__section">
          <div className="registration__section-head">
            <div className="registration__section-icon registration__section-icon--blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h2 className="registration__section-title">Work Information</h2>
          </div>
          <div className="registration__grid">
            <Input
              label="Department"
              name="department"
              value={values.department}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.department && errors.department}
              placeholder="e.g. Engineering"
              required
            />
            <Input
              label="Role / Position"
              name="role"
              value={values.role}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.role && errors.role}
              placeholder="e.g. Senior Developer"
              required
            />
          </div>
        </Card>

        {/* Address */}
        <Card className="registration__section">
          <div className="registration__section-head">
            <div className="registration__section-icon registration__section-icon--green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h2 className="registration__section-title">Address Details</h2>
          </div>
          <div className="registration__grid registration__grid--full">
            <Input
              label="Street address"
              name="address"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.address && errors.address}
              placeholder="123 Main St, Apt 4B"
              required
            />
          </div>
          <div className="registration__grid">
            <Input
              label="City"
              name="city"
              value={values.city}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.city && errors.city}
              placeholder="New York"
              required
            />
            <Input
              label="Country"
              name="country"
              value={values.country}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.country && errors.country}
              placeholder="United States"
              required
            />
          </div>
        </Card>

        {/* Bio & Preferences */}
        <Card className="registration__section">
          <div className="registration__section-head">
            <div className="registration__section-icon registration__section-icon--orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <h2 className="registration__section-title">Bio & Preferences</h2>
          </div>
          <div className="registration__grid registration__grid--full">
            <div className="input-group">
              <label className="input-label" htmlFor="bio">
                Bio <span className="input-required"> *</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={values.bio}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tell us a bit about yourself (min. 20 characters)..."
                rows="4"
                className={`registration__textarea ${touched.bio && errors.bio ? 'registration__textarea--error' : ''}`}
              />
              <div className="registration__bio-footer">
                {touched.bio && errors.bio && (
                  <span className="input-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    {errors.bio}
                  </span>
                )}
                <span className="registration__char-count">{values.bio.length} chars</span>
              </div>
            </div>
          </div>
          <div className="registration__checkboxes">
            <label className="registration__checkbox">
              <input
                type="checkbox"
                checked={values.newsletter}
                onChange={handleCheckbox('newsletter')}
              />
              <div>
                <span className="registration__checkbox-label">Newsletter</span>
                <span className="registration__checkbox-hint">Receive product updates and news</span>
              </div>
            </label>
            <label className="registration__checkbox">
              <input
                type="checkbox"
                checked={values.notifications}
                onChange={handleCheckbox('notifications')}
              />
              <div>
                <span className="registration__checkbox-label">Email Notifications</span>
                <span className="registration__checkbox-hint">Get notified about account activity</span>
              </div>
            </label>
          </div>
        </Card>

        <div className="registration__actions">
          <Button type="button" variant="ghost" onClick={reset} size="lg">
            Reset Form
          </Button>
          <Button type="submit" loading={loading} size="lg">
            Submit Registration
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Registration;
