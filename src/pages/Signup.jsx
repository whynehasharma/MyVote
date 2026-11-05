import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('voter');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signup({ name, email, password, confirmPassword, role });
      showToast(`Account created! Welcome, ${user.name}`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>Create Account</h2>
          <p className="muted small">Join MyVote to participate in active elections</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="suName">Full Name</label>
            <input
              id="suName"
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="suEmail">Email Address</label>
            <input
              id="suEmail"
              type="email"
              placeholder="you@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="suPassword">Password (min 8 characters)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="suPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '38px' }}
                required
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  padding: '6px'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="suConfirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="suConfirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: '38px' }}
                required
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  padding: '6px'
                }}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {password && (
            <div style={{ marginBottom: '14px', display: 'flex', gap: '16px', fontSize: '12px' }}>
              <span style={{ color: password.length >= 8 ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {password.length >= 8 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                At least 8 chars
              </span>
              {confirmPassword && (
                <span style={{ color: password === confirmPassword ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {password === confirmPassword ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  Passwords match
                </span>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="suRole">Role</label>
            <select
              id="suRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="voter">Voter (Cast ballots & view results)</option>
              <option value="admin">Admin (Manage users, elections & audit)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '12px', padding: '10px' }}
            disabled={isSubmitting}
          >
            <UserPlus size={16} />
            <span>{isSubmitting ? 'Registering...' : 'Create Account'}</span>
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }} className="small muted">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
