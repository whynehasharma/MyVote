import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, Trash2, Power, ArrowUp, ArrowDown, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { formatDate, formatCountdown } from '../utils/helpers';

export default function ElectionManagement() {
  const { currentUser } = useAuth();
  const {
    elections,
    createElection,
    toggleElection,
    deleteElection,
    addCandidate,
    removeCandidate,
    reorderCandidate,
    showConfirmation,
    showToast
  } = useApp();

  const [title, setTitle] = useState('');
  const [ends, setEnds] = useState('');
  const [candidateInputs, setCandidateInputs] = useState({});
  const [, setTick] = useState(0);

  // Re-render every second to update countdown display
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      createElection({ title, ends: ends || null }, currentUser);
      setTitle('');
      setEnds('');
    } catch {
      // Toast handles error
    }
  };

  const handleToggle = (el) => {
    try {
      toggleElection(el.id, currentUser);
    } catch {
      // Toast handles error
    }
  };

  const handleDeleteElection = (el) => {
    showConfirmation({
      title: 'Delete Election?',
      message: `Are you sure you want to delete "${el.title}"? All registered candidates and associated votes will be permanently deleted.`,
      confirmText: 'Delete Election',
      danger: true,
      onConfirm: () => deleteElection(el.id, currentUser)
    });
  };

  const handleCandidateInputChange = (electionId, val) => {
    setCandidateInputs((prev) => ({ ...prev, [electionId]: val }));
  };

  const handleAddCandidate = (electionId) => {
    const val = candidateInputs[electionId];
    if (!val || !val.trim()) {
      showToast('Candidate name is required', 'error');
      return;
    }

    try {
      addCandidate(electionId, val, currentUser);
      setCandidateInputs((prev) => ({ ...prev, [electionId]: '' }));
    } catch {
      // Toast handles error
    }
  };

  const handleRemoveCandidate = (electionId, c) => {
    showConfirmation({
      title: 'Remove Candidate?',
      message: `Are you sure you want to remove "${c.label}" from this election? Their votes will also be reset.`,
      confirmText: 'Remove Candidate',
      danger: true,
      onConfirm: () => removeCandidate(electionId, c.id, currentUser)
    });
  };

  return (
    <div>
      {/* Create Election Form */}
      <div className="card">
        <h2>Election Administration</h2>
        <p className="muted small" style={{ marginBottom: '16px' }}>
          Create and configure elections, manage ballot candidates, and monitor closing timers
        </p>

        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Election title (e.g. Student Senate 2026)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ flex: 3, minWidth: '220px' }}
            required
          />
          <input
            type="datetime-local"
            value={ends}
            onChange={(e) => setEnds(e.target.value)}
            style={{ flex: 2, minWidth: '180px' }}
            title="Closing date and time (optional)"
          />
          <button type="submit" className="btn btn-primary" style={{ height: '42px', alignSelf: 'center' }}>
            <PlusCircle size={16} />
            <span>Create Election</span>
          </button>
        </form>
      </div>

      {/* Elections List */}
      <div className="card">
        <h3>Configured Elections ({elections.length})</h3>

        {elections.length === 0 ? (
          <div className="muted" style={{ padding: '30px 0', textAlign: 'center' }}>
            No elections configured yet. Create one above to get started.
          </div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            {elections.map((el) => {
              const countdown = el.ends ? formatCountdown(el.ends) : null;
              const isExpired = countdown?.expired;
              const candidates = el.candidates || [];

              return (
                <div key={el.id} className="card" style={{ border: '1px solid var(--border)', marginBottom: '18px' }}>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between row-responsive">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 style={{ fontSize: '18px' }}>{el.title}</h4>
                        <span className={`badge ${el.active ? 'badge-success' : 'badge-muted'}`}>
                          {el.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="small muted" style={{ marginTop: '4px' }}>
                        Created: {formatDate(el.createdAt)}
                        {el.ends && ` • Ends: ${formatDate(el.ends)}`}
                        {el.active && countdown && (
                          <span style={{ marginLeft: '8px', color: isExpired ? 'var(--danger)' : 'var(--accent)', fontWeight: 600 }}>
                            <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                            {countdown.text}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        className={`btn btn-small ${el.active ? 'btn-ghost' : 'btn-primary'}`}
                        onClick={() => handleToggle(el)}
                        title={el.active ? 'Deactivate election' : 'Activate election'}
                      >
                        <Power size={14} />
                        <span>{el.active ? 'Deactivate' : 'Activate'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteElection(el)}
                        title="Delete election"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Candidate Sub-row */}
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Candidate full name / affiliation..."
                      value={candidateInputs[el.id] || ''}
                      onChange={(e) => handleCandidateInputChange(el.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCandidate(el.id))}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => handleAddCandidate(el.id)}
                    >
                      <UserPlus size={14} />
                      <span>Add Candidate</span>
                    </button>
                  </div>

                  {/* Candidate List */}
                  {candidates.length > 0 && (
                    <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <div className="small muted" style={{ marginBottom: '8px' }}>
                        Ballot Candidates ({candidates.length})
                      </div>
                      {candidates.map((c, idx) => {
                        const votes = el.votes?.[c.id] || 0;
                        return (
                          <div key={c.id} className="list-item" style={{ padding: '8px 12px' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.label}</div>
                              <div className="small muted">Recorded votes: {votes}</div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className="btn btn-ghost btn-small btn-icon"
                                onClick={() => reorderCandidate(el.id, c.id, 'up')}
                                disabled={idx === 0}
                                title="Move up on ballot"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-small btn-icon"
                                onClick={() => reorderCandidate(el.id, c.id, 'down')}
                                disabled={idx === candidates.length - 1}
                                title="Move down on ballot"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-small"
                                onClick={() => handleRemoveCandidate(el.id, c)}
                                title="Remove candidate from ballot"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
