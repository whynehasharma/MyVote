import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Shield,
  User,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { formatDate } from '../utils/helpers';

export default function UserManagement() {
  const { currentUser } = useAuth();
  const { users, addUser, editUser, changeUserPassword, deleteUser, showConfirmation, showToast } = useApp();

  // Add User Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('voter');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  // Edit User Modal state (Name, Email, Role only - no password)
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('voter');

  // Change Password Modal state
  const [passwordTargetUser, setPasswordTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showModalNewPassword, setShowModalNewPassword] = useState(false);
  const [showModalConfirmPassword, setShowModalConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Add User submit handler
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showToast('Please complete all required fields.', 'error');
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
      await addUser({ name, email, role, password, confirmPassword }, currentUser);
      setName('');
      setEmail('');
      setRole('voter');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch {
      // Toast already shown by AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (u) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      editUser(editingUser.id, { name: editName, email: editEmail, role: editRole }, currentUser);
      setEditingUser(null);
    } catch {
      // Toast handles error
    }
  };

  // Open Change Password Modal
  const openPasswordModal = (u) => {
    setPasswordTargetUser(u);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowModalNewPassword(false);
    setShowModalConfirmPassword(false);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordTargetUser) return;

    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changeUserPassword(passwordTargetUser.id, newPassword, confirmNewPassword, currentUser);
      setPasswordTargetUser(null);
    } catch {
      // Handled
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDelete = (u) => {
    showConfirmation({
      title: 'Delete User Account?',
      message: `Are you sure you want to delete "${u.name}" (${u.email})? This action will permanently remove their access.`,
      confirmText: 'Delete User',
      danger: true,
      onConfirm: () => deleteUser(u.id, currentUser)
    });
  };

  const filteredUsers = users.filter((u) => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Top Card: Add User with Password & Confirmation */}
      <div className="card">
        <h2>User Management</h2>
        <p className="muted small" style={{ marginBottom: '20px' }}>
          Create and administer voter accounts and system administrators with secure credentials
        </p>

        <form onSubmit={handleAddUser}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="role">Role *</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="voter">Voter (Standard access)</option>
                <option value="admin">Admin (Full administrative privileges)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '14px' }}>
            {/* Password Field with Show/Hide Toggle */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="password">Password (min 8 characters) *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter secure password"
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field with Show/Hide Toggle */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
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
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ height: '42px' }}
                disabled={isSubmitting}
              >
                <UserPlus size={16} />
                <span>{isSubmitting ? 'Creating User...' : 'Add User'}</span>
              </button>
            </div>
          </div>

          {/* Validation Status Hints */}
          {password && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '16px', fontSize: '12px' }}>
              <span style={{ color: password.length >= 8 ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {password.length >= 8 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                At least 8 characters
              </span>
              {confirmPassword && (
                <span style={{ color: password === confirmPassword ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {password === confirmPassword ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  Passwords match
                </span>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Directory Table Card */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3>User Directory ({filteredUsers.length})</h3>
            <p className="muted small">All active voters and administrators in the system</p>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                paddingLeft: '32px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '13px'
              }}
            />
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="muted" style={{ padding: '30px 0', textAlign: 'center' }}>
            No users matched your search criteria.
          </div>
        ) : (
          <div>
            {filteredUsers.map((u) => {
              const isSelf = u.id === currentUser.id;
              const status = u.status || 'active';

              return (
                <div key={u.id} className="list-item" style={{ padding: '14px 18px' }}>
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: u.role === 'admin' ? 'var(--primary-light)' : 'var(--success-light)',
                        color: u.role === 'admin' ? 'var(--primary)' : 'var(--success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {u.role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{u.name}</span>
                        {isSelf && <span className="small muted">(You)</span>}
                        <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-muted'}`} style={{ fontSize: '11px' }}>
                          {status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                      <div className="small muted" style={{ marginTop: '2px' }}>
                        {u.email} • <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{u.role}</span>
                        {u.createdAt && ` • Registered ${formatDate(u.createdAt)}`}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit, Change Password, Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => openEditModal(u)}
                      title="Edit user details (Name, Email, Role)"
                    >
                      <Edit2 size={14} /> Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => openPasswordModal(u)}
                      title="Reset or set a new password for this user"
                    >
                      <KeyRound size={14} /> Change Password
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      disabled={isSelf}
                      onClick={() => handleDelete(u)}
                      title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit User Modal (Name, Email, Role ONLY - No Passwords Displayed) */}
      <Modal
        isOpen={Boolean(editingUser)}
        title="Edit User Details"
        onClose={() => setEditingUser(null)}
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label htmlFor="editName">Full Name</label>
            <input
              id="editName"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="editEmail">Email Address</label>
            <input
              id="editEmail"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="editRole">Role</label>
            <select
              id="editRole"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <option value="voter">Voter</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-between gap-3" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setEditingUser(null)}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Dedicated Change Password Modal */}
      <Modal
        isOpen={Boolean(passwordTargetUser)}
        title={`Set New Password: ${passwordTargetUser?.name || ''}`}
        onClose={() => setPasswordTargetUser(null)}
      >
        <form onSubmit={handleSavePassword}>
          <p className="muted small" style={{ marginBottom: '16px' }}>
            Set a new secure password for <strong>{passwordTargetUser?.email}</strong>. The user's password will be encrypted using PBKDF2 Web Crypto API.
          </p>

          <div className="form-group">
            <label htmlFor="modalNewPassword">New Password (min 8 characters)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="modalNewPassword"
                type={showModalNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingRight: '38px' }}
                required
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowModalNewPassword(!showModalNewPassword)}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  padding: '6px'
                }}
                title={showModalNewPassword ? 'Hide password' : 'Show password'}
              >
                {showModalNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="modalConfirmPassword">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="modalConfirmPassword"
                type={showModalConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                style={{ paddingRight: '38px' }}
                required
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowModalConfirmPassword(!showModalConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  padding: '6px'
                }}
                title={showModalConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showModalConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {newPassword && (
            <div style={{ marginBottom: '14px', display: 'flex', gap: '16px', fontSize: '12px' }}>
              <span style={{ color: newPassword.length >= 8 ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {newPassword.length >= 8 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                At least 8 chars
              </span>
              {confirmNewPassword && (
                <span style={{ color: newPassword === confirmNewPassword ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {newPassword === confirmNewPassword ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  Passwords match
                </span>
              )}
            </div>
          )}

          <div className="flex justify-between gap-3" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPasswordTargetUser(null)}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Updating...' : 'Set Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
