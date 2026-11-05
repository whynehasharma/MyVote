import React, { useState } from 'react';
import { FileText, Search, ShieldCheck, Download, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

export default function AuditLogs() {
  const { auditLogs, exportAllData } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    // Action category filter
    if (actionFilter === 'vote' && log.action !== 'vote') return false;
    if (actionFilter === 'auth' && !['login', 'logout', 'signup', 'create_account'].includes(log.action)) return false;
    if (actionFilter === 'elections' && !log.action.includes('election') && !log.action.includes('candidate')) return false;
    if (actionFilter === 'users' && !log.action.includes('user')) return false;

    // Search query filter
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      log.action.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      JSON.stringify(log.meta || {}).toLowerCase().includes(q)
    );
  });

  const getActionBadgeClass = (action) => {
    if (action === 'vote') return 'badge-success';
    if (action.includes('delete') || action.includes('remove')) return 'badge-danger';
    if (action.includes('create') || action.includes('signup')) return 'badge-primary';
    if (action.includes('auto_close') || action.includes('toggle')) return 'badge-warning';
    return 'badge-muted';
  };

  return (
    <div>
      <div className="card">
        <div className="flex items-center justify-between row-responsive">
          <div className="flex items-center gap-3">
            <FileText size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <h2>System Audit Trail</h2>
              <p className="muted small">Immutable security logs of administrative and voter operations (Retains latest 1,000 events)</p>
            </div>
          </div>

          <button type="button" className="btn btn-ghost btn-small mt-2" onClick={exportAllData}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search by action, user email, or metadata..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: '34px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
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

          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-small ${actionFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActionFilter('all')}
            >
              All ({auditLogs.length})
            </button>
            <button
              type="button"
              className={`btn btn-small ${actionFilter === 'vote' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActionFilter('vote')}
            >
              Votes
            </button>
            <button
              type="button"
              className={`btn btn-small ${actionFilter === 'elections' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActionFilter('elections')}
            >
              Elections
            </button>
            <button
              type="button"
              className={`btn btn-small ${actionFilter === 'users' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActionFilter('users')}
            >
              Users
            </button>
            <button
              type="button"
              className={`btn btn-small ${actionFilter === 'auth' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActionFilter('auth')}
            >
              Auth
            </button>
          </div>
        </div>
      </div>

      {/* Log Entries */}
      <div className="card">
        <h3>Audit Records ({filteredLogs.length})</h3>

        {filteredLogs.length === 0 ? (
          <div className="muted" style={{ padding: '30px 0', textAlign: 'center' }}>
            No audit records match the current filter.
          </div>
        ) : (
          <div style={{ marginTop: '14px' }}>
            {filteredLogs.map((log) => (
              <div key={log.id} className="list-item" style={{ padding: '12px 16px' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>by {log.user}</span>
                  </div>
                  <div className="small muted" style={{ marginTop: '4px' }}>
                    {formatDate(log.time)} • Event ID: <span className="kbd">{log.id}</span>
                  </div>
                </div>

                <div
                  className="small muted"
                  style={{
                    maxWidth: '450px',
                    wordBreak: 'break-word',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                >
                  {log.meta && Object.keys(log.meta).length > 0 ? (
                    JSON.stringify(log.meta)
                  ) : (
                    <span style={{ fontStyle: 'italic' }}>no metadata</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
