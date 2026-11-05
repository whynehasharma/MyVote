import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading session...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ color: 'var(--danger)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <ShieldAlert size={48} />
        </div>
        <h2 style={{ marginBottom: '8px' }}>Access Denied</h2>
        <p className="muted" style={{ marginBottom: '24px' }}>
          You do not have administrative privileges to view this page. This section is restricted to administrators.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', margin: '0 auto' }}>
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return children;
}
