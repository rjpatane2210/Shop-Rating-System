import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { Lock, Check, X, AlertCircle } from 'lucide-react';

const PasswordModal = ({ isOpen, onClose }) => {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation state checks for new password
  const lengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const uppercaseValid = /[A-Z]/.test(newPassword);
  const specialCharValid = /[!@#$%^&*(),.?":{}|<>_\-\+\=]/.test(newPassword);
  const matchValid = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!lengthValid || !uppercaseValid || !specialCharValid) {
      setError('Please ensure your new password satisfies all requirements.');
      return;
    }

    if (!matchValid) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Password">
      <form onSubmit={handleSubmit} className="form-space">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Current Password</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              className="form-control"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password (8-16 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Live validation rules display */}
        <div className="validation-rules-card">
          <div className={`rule-item ${lengthValid ? 'valid' : ''}`}>
            {lengthValid ? <Check size={14} /> : <X size={14} />}
            <span>8 to 16 characters ({newPassword.length}/16)</span>
          </div>
          <div className={`rule-item ${uppercaseValid ? 'valid' : ''}`}>
            {uppercaseValid ? <Check size={14} /> : <X size={14} />}
            <span>At least 1 uppercase letter (A-Z)</span>
          </div>
          <div className={`rule-item ${specialCharValid ? 'valid' : ''}`}>
            {specialCharValid ? <Check size={14} /> : <X size={14} />}
            <span>At least 1 special character (!@#$%^&*)</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              className="form-control"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !lengthValid || !uppercaseValid || !specialCharValid || !matchValid}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordModal;
