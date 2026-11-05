import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Vote, Activity, CheckCircle, Clock, ArrowRight, Shield, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

export default function Dashboard() {
  const { currentUser, isAdmin } = useAuth();
  const { users, elections, auditLogs, hasVoted } = useApp();

  const activeElections = elections.filter((e) => e.active);
  const totalVotesCast = elections.reduce((sum, e) => {
    return sum + Object.values(e.votes || {}).reduce((s, v) => s + (Number(v) || 0), 0);
  }, 0);

  return (
    <div>
      {/* Welcome Header */}
      <div className="card">
        <div className="flex items-center justify-between row-responsive">
          <div>
            <h2>Dashboard</h2>
            <p className="muted" style={{ marginTop: '4px' }}>
              Welcome back, <strong>{currentUser.name}</strong>. Here is your overview for today.
            </p>
          </div>
          <div>
            <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-success'}`}>
              Role: {isAdmin ? 'Administrator' : 'Voter'}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="small muted">Registered Users</div>
              <div className="metric-number">{users.length}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Vote size={24} />
            </div>
            <div>
              <div className="small muted">Active Elections</div>
              <div className="metric-number">
                {activeElections.length} <span style={{ fontSize: '14px', color: 'var(--muted)' }}>/ {elections.length}</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="small muted">Total Ballots Cast</div>
              <div className="metric-number">{totalVotesCast}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
              <Activity size={24} />
            </div>
            <div>
              <div className="small muted">Audit Events</div>
              <div className="metric-number">{auditLogs.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Elections Section */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3>Active Elections</h3>
            <p className="muted small">Elections currently open for voting</p>
          </div>
          <Link to="/vote" className="btn btn-ghost btn-small">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {activeElections.length === 0 ? (
          <div className="muted" style={{ padding: '24px 0', textAlign: 'center' }}>
            No elections are currently active.
            {isAdmin && (
              <div style={{ marginTop: '8px' }}>
                <Link to="/elections" className="btn btn-primary btn-small">
                  Manage Elections
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div>
            {activeElections.map((el) => {
              const alreadyVoted = hasVoted(el.id, currentUser.id);
              const candidateCount = el.candidates ? el.candidates.length : 0;
              const votesCount = Object.values(el.votes || {}).reduce((s, v) => s + (Number(v) || 0), 0);

              return (
                <div key={el.id} className="list-item">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{el.title}</div>
                    <div className="small muted" style={{ marginTop: '4px' }}>
                      {candidateCount} candidates • {votesCount} votes recorded
                      {el.ends && ` • Ends: ${formatDate(el.ends)}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alreadyVoted ? (
                      <span className="badge badge-success">Ballot Cast</span>
                    ) : (
                      <Link to="/vote" className="btn btn-primary btn-small">
                        Vote Now
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {isAdmin ? (
          <>
            <div className="card">
              <div className="flex items-center gap-3" style={{ marginBottom: '10px' }}>
                <Shield size={20} style={{ color: 'var(--primary)' }} />
                <h4>Election Administration</h4>
              </div>
              <p className="muted small" style={{ marginBottom: '14px' }}>
                Configure elections, set countdown timers, and manage ballot candidates.
              </p>
              <div className="flex gap-2">
                <Link to="/elections" className="btn btn-primary btn-small">
                  Elections
                </Link>
                <Link to="/candidates" className="btn btn-ghost btn-small">
                  Candidates
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3" style={{ marginBottom: '10px' }}>
                <Users size={20} style={{ color: 'var(--primary)' }} />
                <h4>User Governance</h4>
              </div>
              <p className="muted small" style={{ marginBottom: '14px' }}>
                Manage registered voters and administrators, edit roles, or view audit trails.
              </p>
              <div className="flex gap-2">
                <Link to="/users" className="btn btn-ghost btn-small">
                  Manage Users
                </Link>
                <Link to="/audit" className="btn btn-ghost btn-small">
                  Audit Logs
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '10px' }}>
              <Vote size={20} style={{ color: 'var(--primary)' }} />
              <h4>Voter Information</h4>
            </div>
            <p className="muted small" style={{ marginBottom: '14px' }}>
              Your vote is completely private and auditable in LocalStorage. You can participate in all open elections and view live visual charts of ongoing results anytime.
            </p>
            <div className="flex gap-2">
              <Link to="/vote" className="btn btn-primary btn-small">
                Go to Voting Booth
              </Link>
              <Link to="/results" className="btn btn-ghost btn-small">
                View Results & Analytics
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {isAdmin && (
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
            <div>
              <h3>Recent System Actions</h3>
              <p className="muted small">Latest security and administrative activities</p>
            </div>
            <Link to="/audit" className="btn btn-ghost btn-small">
              View All Logs
            </Link>
          </div>

          <div>
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="list-item" style={{ padding: '8px 12px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    <span className="badge badge-primary" style={{ marginRight: '8px' }}>
                      {log.action}
                    </span>
                    <span className="muted">by {log.user}</span>
                  </div>
                </div>
                <div className="small muted">{formatDate(log.time)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
