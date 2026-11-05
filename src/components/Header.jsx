import React from 'react';
import { Vote, Download, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { exportAllData, clearAllData, showConfirmation } = useApp();

  const handleClearData = () => {
    showConfirmation({
      title: 'Reset All Application Data?',
      message: 'This will erase all users, elections, candidates, and audit records from LocalStorage and restore defaults. This action cannot be undone.',
      confirmText: 'Clear All Data',
      danger: true,
      onConfirm: () => {
        clearAllData();
        logout();
      }
    });
  };

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Vote size={26} />
          <span>MyVote</span>
        </div>
        <div className="brand-subtitle">
          <span>Online Voting System</span>
          <span className="muted" style={{ fontSize: '11px' }}>• Secure • Auditable • Accessible</span>
        </div>
      </div>

      <div className="header-actions">
        {currentUser && <SearchBar />}

        <ThemeToggle />

        {currentUser && (
          <>
            {/* Admin-only data export & reset buttons */}
            {isAdmin && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={exportAllData}
                  title="Export all system data to CSV"
                >
                  <Download size={15} />
                  <span>Export</span>
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={handleClearData}
                  title="Reset application to factory defaults"
                >
                  <RefreshCw size={15} />
                  <span>Reset</span>
                </button>
              </>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={logout}
              title="Sign out of current account"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
