import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserCheck, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginAsAdminDemo, loginAsVoterDemo } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAdmin = async () => {
    try {
      const user = await loginAsAdminDemo();
      showToast(`Signed in as ${user.name} (Admin)`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDemoVoter = async () => {
    try {
      const user = await loginAsVoterDemo();
      showToast(`Signed in as ${user.name} (Voter)`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>Sign in to MyVote</h2>
          <p className="muted small">Enter your credentials or use the 1-click demo accounts</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
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

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '8px', padding: '10px' }}
            disabled={isSubmitting}
          >
            <LogIn size={16} />
            <span>{isSubmitting ? 'Verifying...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ margin: '24px 0', borderTop: '1px solid var(--border)', position: 'relative' }}>
          <span
            className="muted small"
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--card)',
              padding: '0 8px'
            }}
          >
            Instant Demo Access
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-small w-full"
            onClick={handleDemoAdmin}
            title="Instant Admin Login (admin@example.com / admin)"
          >
            <Shield size={14} style={{ color: 'var(--primary)' }} />
            <span>Demo Admin</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-small w-full"
            onClick={handleDemoVoter}
            title="Instant Voter Login (voter@example.com / voter)"
          >
            <UserCheck size={14} style={{ color: 'var(--success)' }} />
            <span>Demo Voter</span>
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }} className="small muted">
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
