import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import { ConfirmationModal } from './components/Modal';
import Modal from './components/Modal';
import Chatbot from './components/chatbot/Chatbot';
import { useAuth } from './hooks/useAuth';
import { useApp } from './context/AppContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ElectionManagement from './pages/ElectionManagement';
import CandidateManagement from './pages/CandidateManagement';
import Voting from './pages/Voting';
import Results from './pages/Results';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';

export default function App() {
  const { currentUser, isAdmin } = useAuth();
  const { createElection } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Keyboard shortcut 'N' quick election modal
  const [quickElectionOpen, setQuickElectionOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

  useEffect(() => {
    const handleKeyUp = (e) => {
      // Don't trigger if user is typing in an input, textarea, or select
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;

      if (e.key === 'n' || e.key === 'N') {
        if (currentUser && isAdmin) {
          e.preventDefault();
          setQuickElectionOpen(true);
        }
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [currentUser, isAdmin]);

  const handleQuickCreate = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    try {
      createElection({ title: quickTitle }, currentUser);
      setQuickTitle('');
      setQuickElectionOpen(false);
      navigate('/elections');
    } catch {
      // Error handled by app context toast
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="app-container">
      <Header />

      <div className="app-body">
        {currentUser && !isAuthPage && <Sidebar />}

        <main className="main-content">
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
              path="/signup"
              element={currentUser ? <Navigate to="/dashboard" replace /> : <Signup />}
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vote"
              element={
                <ProtectedRoute>
                  <Voting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Admin-only Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elections"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ElectionManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CandidateManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            {/* Default Catch-all */}
            <Route
              path="*"
              element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
            />
          </Routes>
        </main>
      </div>

      <footer className="footer small muted">
        MyVote – Secure • Auditable • Accessible Online Voting System
      </footer>

      {/* Floating Smart Voting Assistant (Authenticated Only) */}
      {currentUser && !isAuthPage && <Chatbot />}

      {/* Global Modals & Notifications */}
      <Toast />
      <ConfirmationModal />

      {/* Keyboard Shortcut Quick Election Modal */}
      <Modal
        isOpen={quickElectionOpen}
        title="Quick Election Creator (Key: N)"
        onClose={() => setQuickElectionOpen(false)}
      >
        <form onSubmit={handleQuickCreate}>
          <div className="form-group">
            <label htmlFor="quickTitle">Election Title</label>
            <input
              id="quickTitle"
              type="text"
              placeholder="e.g. Board of Trustees 2026"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="flex justify-between gap-3" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setQuickElectionOpen(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Create Election
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
