import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth';

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = authService.login(password);
    if (result.success) {
      setPassword('');
      setError('');
      onLoginSuccess();
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '420px' }}
      >
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>
            <Lock size={19} style={{ color: '#818cf8' }} />
            <span>Admin Authentication</span>
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: '1.1rem', padding: '1.75rem 1.5rem 1.25rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'rgba(99, 102, 241, 0.15)', 
                  color: '#818cf8', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Please enter the admin password saved in your <code style={{ color: '#a5b4fc', background: 'rgba(255,255,255,0.06)', padding: '2px 5px', borderRadius: '4px' }}>.env</code> file to log or edit problems.
              </p>
            </div>

            {error && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'rgba(244, 63, 94, 0.12)', 
                  border: '1px solid rgba(244, 63, 94, 0.3)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.65rem 0.85rem', 
                  color: '#f43f5e', 
                  fontSize: '0.8rem' 
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="admin-password-input">
                Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter admin password..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className="icon-btn"
                  style={{ 
                    position: 'absolute', 
                    right: '8px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              id="btn-submit-login"
              className="btn btn-primary"
              style={{ minWidth: '120px' }}
            >
              Unlock Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
