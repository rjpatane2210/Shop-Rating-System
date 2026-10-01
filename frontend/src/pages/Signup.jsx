import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, Mail, Lock, MapPin, UserPlus, Check, X, AlertCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validation state checks
  const nameLength = formData.name.trim().length;
  const nameValid = nameLength >= 20 && nameLength <= 60;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = emailRegex.test(formData.email.trim());

  const addressLength = formData.address.trim().length;
  const addressValid = addressLength > 0 && addressLength <= 400;

  const passwordLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const passwordUppercaseValid = /[A-Z]/.test(formData.password);
  const passwordSpecialValid = /[!@#$%^&*(),.?":{}|<>_\-\+\=]/.test(formData.password);
  const passwordValid = passwordLengthValid && passwordUppercaseValid && passwordSpecialValid;

  const isFormValid = nameValid && emailValid && addressValid && passwordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please resolve all validation requirements before submitting.');
      return;
    }

    setLoading(true);

    try {
      await signup(formData);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <div className="auth-brand-logo">
            <Store size={36} />
          </div>
          <h2>Create User Account</h2>
          <p>Register as a Normal User to rate registered stores</p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-space">
          {/* Name Field */}
          <div className="form-group">
            <div className="label-with-hint">
              <label className="form-label">Full Name</label>
              <span className={`char-counter ${nameValid ? 'text-success' : nameLength > 0 ? 'text-danger' : ''}`}>
                {nameLength}/60 chars (Min 20)
              </span>
            </div>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                className={`form-control ${nameLength > 0 && !nameValid ? 'is-invalid' : ''}`}
                placeholder="Enter full name (20 to 60 characters)"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            {nameLength > 0 && !nameValid && (
              <small className="field-error-msg">
                Name must be between 20 and 60 characters long.
              </small>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                className={`form-control ${formData.email && !emailValid ? 'is-invalid' : ''}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {formData.email && !emailValid && (
              <small className="field-error-msg">
                Please enter a valid email address.
              </small>
            )}
          </div>

          {/* Address Field */}
          <div className="form-group">
            <div className="label-with-hint">
              <label className="form-label">Address</label>
              <span className={`char-counter ${addressValid ? 'text-success' : addressLength > 400 ? 'text-danger' : ''}`}>
                {addressLength}/400 chars
              </span>
            </div>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" style={{ marginTop: '10px' }} />
              <textarea
                name="address"
                rows="2"
                className={`form-control ${addressLength > 400 ? 'is-invalid' : ''}`}
                placeholder="Enter physical address (Max 400 characters)"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            {addressLength > 400 && (
              <small className="field-error-msg">
                Address cannot exceed 400 characters.
              </small>
            )}
          </div>

          {/* Password Field & Rules */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="validation-rules-card mt-2">
              <div className={`rule-item ${passwordLengthValid ? 'valid' : ''}`}>
                {passwordLengthValid ? <Check size={14} /> : <X size={14} />}
                <span>8 to 16 characters</span>
              </div>
              <div className={`rule-item ${passwordUppercaseValid ? 'valid' : ''}`}>
                {passwordUppercaseValid ? <Check size={14} /> : <X size={14} />}
                <span>At least 1 uppercase letter</span>
              </div>
              <div className={`rule-item ${passwordSpecialValid ? 'valid' : ''}`}>
                {passwordSpecialValid ? <Check size={14} /> : <X size={14} />}
                <span>At least 1 special character</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !isFormValid}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Registering Account...' : 'Sign Up'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
