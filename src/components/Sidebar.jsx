import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Vote,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  Upload,
  Download,
  Award,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { currentUser, isAdmin } = useAuth();
  const { exportAllData, importDataFromFile, elections } = useApp();
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importDataFromFile(file);
      e.target.value = '';
    }
  };

  if (!currentUser) return null;

  return (
    <aside className="app-sidebar card">
      {/* User Info */}
      <div className="user-profile-badge">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
          ) : (
            <UserCheck size={20} style={{ color: 'var(--success)' }} />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{currentUser.name}</div>
            <div className="small muted">{currentUser.email}</div>
          </div>
        </div>
        <div style={{ marginTop: '8px' }}>
          <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-success'}`}>
            {isAdmin ? 'Administrator' : 'Voter'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-links" aria-label="Main Navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {/* Admin Navigation Items */}
        {isAdmin && (
          <>
            <NavLink
              to="/users"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>User Management</span>
            </NavLink>

            <NavLink
              to="/elections"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Vote size={18} />
              <span>Election Management</span>
            </NavLink>

            <NavLink
              to="/candidates"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Award size={18} />
              <span>Candidate Setup</span>
            </NavLink>

            <NavLink
              to="/audit"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Audit Logs</span>
            </NavLink>
          </>
        )}

        {/* Voter / Shared Navigation Items */}
        <NavLink
          to="/vote"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Vote size={18} />
          <span>{isAdmin ? 'Vote' : 'Active Elections / Voting'}</span>
        </NavLink>

        {elections.length > 0 && (
          <NavLink
            to="/results"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            <span>Results & Analytics</span>
          </NavLink>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <SettingsIcon size={18} />
          <span>{isAdmin ? 'Settings' : 'My Profile / Settings'}</span>
        </NavLink>
      </nav>

      {/* Admin-Only Data Portability Controls */}
      {isAdmin && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: 'auto' }}>
          <div className="small muted" style={{ marginBottom: '8px' }}>
            Data Portability (CSV)
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-small"
              style={{ flex: 1 }}
              onClick={exportAllData}
            >
              <Download size={14} /> Export
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              style={{ flex: 1 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} /> Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          <div style={{ marginTop: '14px' }} className="small muted">
            Tip: Press <span className="kbd">N</span> to create a new election
          </div>
        </div>
      )}
    </aside>
  );
}
