import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Download,
  Upload,
  RefreshCw,
  Bell,
  CheckCircle2,
  AlertCircle,
  Database,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../utils/helpers';

export default function Settings() {
  const { currentUser, isAdmin } = useAuth();

  if (isAdmin) {
    return <AdminSettings />;
  }

  return <VoterSettings />;
}

/**
 * =========================================================================
 * ADMIN SETTINGS COMPONENT
 * =========================================================================
 */
function AdminSettings() {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const { exportAllData, importDataFromFile, clearAllData, showConfirmation, showToast } = useApp();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification preference state (stored in localStorage)
  const [toastAlerts, setToastAlerts] = useState(() => {
    return localStorage.getItem('ov:pref_alerts') !== 'false';
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      updateProfile(currentUser.id, { name, email });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword: confirmNewPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Your administrator password has been updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleAlerts = () => {
    const nextVal = !toastAlerts;
    setToastAlerts(nextVal);
    localStorage.setItem('ov:pref_alerts', String(nextVal));
    showToast(`Action notifications ${nextVal ? 'enabled' : 'muted'}.`, 'info');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importDataFromFile(file);
      e.target.value = '';
    }
  };

  const handleFactoryReset = () => {
    showConfirmation({
      title: 'Factory Reset All Data?',
      message: 'This will purge all users, elections, votes, and audit logs stored in browser LocalStorage. The application will be restored to fresh initial demonstration state. This action cannot be reversed.',
      confirmText: 'Reset to Factory Defaults',
      danger: true,
      onConfirm: () => {
        clearAllData();
        logout();
      }
    });
  };

  return (
    <div>
      <div className="card">
        <div className="flex items-center gap-3">
          <SettingsIcon size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h2>Administrator Settings</h2>
            <p className="muted small">System configuration, security credentials, and data governance</p>
          </div>
        </div>
      </div>

      {/* 1. Account Settings */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
          <User size={18} style={{ color: 'var(--primary)' }} />
          <h3>Account Information & Profile</h3>
        </div>

        <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="adminName">Full Name</label>
            <input
              id="adminName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="adminEmail">Email Address</label>
            <input
              id="adminEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ height: '42px' }}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          <div className="small muted">
            Role: <span className="badge badge-primary">Administrator</span> • Account ID: <span className="kbd">{currentUser?.id}</span>
          </div>
        </div>
      </div>

      {/* 2. Change Admin Password */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
          <KeyRound size={18} style={{ color: 'var(--primary)' }} />
          <h3>Change Administrator Password</h3>
        </div>

        <form onSubmit={handleChangePassword}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Current Password */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="adminCurrentPassword">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="adminCurrentPassword"
                  type={showCurrentPw ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ paddingRight: '38px' }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    padding: '6px'
                  }}
                  title={showCurrentPw ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="adminNewPassword">New Password (min 8 chars)</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="adminNewPassword"
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '38px' }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => setShowNewPw(!showNewPw)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    padding: '6px'
                  }}
                  title={showNewPw ? 'Hide password' : 'Show password'}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="adminConfirmNewPassword">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="adminConfirmNewPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={{ paddingRight: '38px' }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    padding: '6px'
                  }}
                  title={showConfirmPw ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Encrypting & Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Application Settings */}
      <div className="card">
        <h3>Application Settings</h3>
        <p className="muted small" style={{ marginBottom: '16px' }}>
          Theme customization and notification preferences
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="list-item">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={20} style={{ color: '#06b6d4' }} /> : <Sun size={20} style={{ color: '#f59e0b' }} />}
              <div>
                <div style={{ fontWeight: 600 }}>Theme Mode</div>
                <div className="small muted">Current: {theme === 'dark' ? 'Dark' : 'Light'}</div>
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-small" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          <div className="list-item">
            <div className="flex items-center gap-3">
              <Bell size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Action Toasts</div>
                <div className="small muted">Status: {toastAlerts ? 'Enabled' : 'Muted'}</div>
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-small" onClick={handleToggleAlerts}>
              {toastAlerts ? 'Mute' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Data Management (ADMIN ONLY) */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
          <Shield size={18} style={{ color: 'var(--primary)' }} />
          <h3>System Data Management & Portability</h3>
        </div>
        <p className="muted small" style={{ marginBottom: '16px' }}>
          Administrative data governance: export backups, restore CSV data, or factory reset LocalStorage.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
              <Download size={18} style={{ color: 'var(--primary)' }} />
              <strong>Export System CSV</strong>
            </div>
            <p className="small muted" style={{ marginBottom: '14px' }}>
              Download all registered users, elections, votes, and audit logs into a verified CSV backup.
            </p>
            <button type="button" className="btn btn-primary btn-small w-full" onClick={exportAllData}>
              Download CSV
            </button>
          </div>

          <div className="card" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
              <Upload size={18} style={{ color: 'var(--accent)' }} />
              <strong>Import System CSV</strong>
            </div>
            <p className="small muted" style={{ marginBottom: '14px' }}>
              Upload and restore a previously exported CSV file. Data schema is strictly validated.
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-small w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          <div className="card" style={{ border: '1px solid var(--danger-light)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
              <RefreshCw size={18} style={{ color: 'var(--danger)' }} />
              <strong style={{ color: 'var(--danger)' }}>Factory Reset</strong>
            </div>
            <p className="small muted" style={{ marginBottom: '14px' }}>
              Purge all client-side data and reset the system back to initial demo defaults.
            </p>
            <button type="button" className="btn btn-danger btn-small w-full" onClick={handleFactoryReset}>
              Reset All Data
            </button>
          </div>
        </div>

        {/* Cryptographic Architecture Notice */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-light)',
            border: '1px solid rgba(15, 98, 254, 0.2)',
            fontSize: '13px'
          }}
        >
          <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
            <Database size={16} />
            <span>Cryptographic Web Crypto API Disclosure</span>
          </div>
          <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
            All user passwords in this system are hashed in the browser using the Web Crypto API with PBKDF2 (SHA-256, 100,000 iterations, unique per-user salts). As this is a frontend-only architecture, browser LocalStorage can be inspected or altered using browser developer tools. This system is designed for academic demonstration and prototyping.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * =========================================================================
 * VOTER SETTINGS COMPONENT
 * Strictly user-related options ONLY. No CSV export, import, or reset.
 * =========================================================================
 */
function VoterSettings() {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { showToast } = useApp();
  const { theme, toggleTheme } = useTheme();

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateName = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    setIsUpdatingName(true);
    try {
      updateProfile(currentUser.id, { name: name.trim(), email: currentUser.email });
      showToast('Profile name successfully updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword: confirmNewPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Your password has been securely updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="flex items-center gap-3">
          <User size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h2>My Profile & Voter Settings</h2>
            <p className="muted small">Manage your voter profile, security credentials, and display preferences</p>
          </div>
        </div>
      </div>

      {/* 1. My Profile */}
      <div className="card">
        <h3>My Profile</h3>
        <p className="muted small" style={{ marginBottom: '16px' }}>
          Your registered voting identity
        </p>

        <form onSubmit={handleUpdateName} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="voterName">Full Name</label>
            <input
              id="voterName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="voterEmail">Registered Email</label>
            <input
              id="voterEmail"
              type="email"
              value={currentUser?.email || ''}
              disabled
              title="Voter email cannot be self-modified; contact an administrator to update"
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ height: '42px' }}
              disabled={isUpdatingName}
            >
              {isUpdatingName ? 'Saving...' : 'Update Name'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Change Password */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
          <KeyRound size={18} style={{ color: 'var(--primary)' }} />
          <h3>Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Current Password */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="voterCurrentPassword">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="voterCurrentPassword"
                  type={showCurrentPw ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ paddingRight: '38px' }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    padding: '6px'
                  }}
                  title={showCurrentPw ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="voterNewPassword">New Password (min 8 chars)</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="voterNewPassword"
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '38px' }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => setShowNewPw(!showNewPw)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    padding: '6px'
                  }}
                  title={showNewPw ? 'Hide password' : 'Show password'}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="voterConfirmNewPassword">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="voterConfirmNewPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={{ paddingRight: '38px' }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    padding: '6px'
                  }}
                  title={showConfirmPw ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {newPassword && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '12px' }}>
              <span style={{ color: newPassword.length >= 8 ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {newPassword.length >= 8 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                At least 8 characters
              </span>
              {confirmNewPassword && (
                <span style={{ color: newPassword === confirmNewPassword ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {newPassword === confirmNewPassword ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  Passwords match
                </span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Encrypting & Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Appearance */}
      <div className="card">
        <h3>Appearance</h3>
        <p className="muted small" style={{ marginBottom: '16px' }}>
          Select your preferred interface theme
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={20} style={{ color: '#06b6d4' }} /> : <Sun size={20} style={{ color: '#f59e0b' }} />}
            <div>
              <div style={{ fontWeight: 600 }}>{theme === 'dark' ? 'Dark Theme Active' : 'Light Theme Active'}</div>
              <div className="small muted">High contrast professional visual presentation</div>
            </div>
          </div>

          <button type="button" className="btn btn-ghost" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* 4. Account Information */}
      <div className="card">
        <h3>Account Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '13px' }}>
          <div className="list-item" style={{ padding: '8px 12px' }}>
            <span className="muted">Account Role:</span>
            <span className="badge badge-success">Official Voter</span>
          </div>
          <div className="list-item" style={{ padding: '8px 12px' }}>
            <span className="muted">Registration Status:</span>
            <span className="badge badge-success">Active & Verified</span>
          </div>
          <div className="list-item" style={{ padding: '8px 12px' }}>
            <span className="muted">Registered Email:</span>
            <strong>{currentUser?.email}</strong>
          </div>
          {currentUser?.createdAt && (
            <div className="list-item" style={{ padding: '8px 12px' }}>
              <span className="muted">Account Created:</span>
              <span>{formatDate(currentUser.createdAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
