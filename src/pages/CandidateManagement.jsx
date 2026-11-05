import React, { useState } from 'react';
import { Award, UserPlus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';

export default function CandidateManagement() {
  const { currentUser } = useAuth();
  const {
    elections,
    addCandidate,
    removeCandidate,
    reorderCandidate,
    showConfirmation,
    showToast
  } = useApp();

  const [selectedElectionId, setSelectedElectionId] = useState(() => {
    return elections.length > 0 ? elections[0].id : '';
  });
  const [candidateName, setCandidateName] = useState('');

  const currentElection = elections.find((e) => e.id === selectedElectionId) || elections[0];

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!currentElection) {
      showToast('Please select or create an election first.', 'error');
      return;
    }
    if (!candidateName.trim()) {
      showToast('Candidate name is required.', 'error');
      return;
    }

    try {
      addCandidate(currentElection.id, candidateName, currentUser);
      setCandidateName('');
    } catch {
      // Toast handles error
    }
  };

  const handleRemove = (c) => {
    showConfirmation({
      title: 'Remove Candidate?',
      message: `Are you sure you want to remove candidate "${c.label}" from election "${currentElection.title}"?`,
      confirmText: 'Remove Candidate',
      danger: true,
      onConfirm: () => removeCandidate(currentElection.id, c.id, currentUser)
    });
  };

  return (
    <div>
      <div className="card">
        <div className="flex items-center gap-3">
          <Award size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h2>Candidate Management</h2>
            <p className="muted small">Configure ballot candidates and display hierarchy for each election</p>
          </div>
        </div>

        {elections.length === 0 ? (
          <div className="muted" style={{ padding: '30px 0', textAlign: 'center' }}>
            No elections exist yet. Please create an election first in the Elections panel.
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {/* Election Selector */}
            <div className="form-group">
              <label htmlFor="electionSelect">Select Election</label>
              <select
                id="electionSelect"
                value={currentElection?.id || ''}
                onChange={(e) => setSelectedElectionId(e.target.value)}
              >
                {elections.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.title} {el.active ? '(Active)' : '(Inactive)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Candidate to Selected Election */}
            {currentElection && (
              <form onSubmit={handleAddCandidate} style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <input
                  type="text"
                  placeholder="New candidate name / party affiliation"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={16} />
                  <span>Add Candidate</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Candidate List Card */}
      {currentElection && (
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
            <h3>Candidates for "{currentElection.title}"</h3>
            <span className="badge badge-primary">
              {currentElection.candidates?.length || 0} Registered
            </span>
          </div>

          {!currentElection.candidates || currentElection.candidates.length === 0 ? (
            <div className="muted" style={{ padding: '24px 0', textAlign: 'center' }}>
              No candidates have been registered for this election yet.
            </div>
          ) : (
            <div>
              {currentElection.candidates.map((c, idx) => {
                const votes = currentElection.votes?.[c.id] || 0;
                return (
                  <div key={c.id} className="list-item">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>
                        <span style={{ color: 'var(--muted)', marginRight: '10px' }}>#{idx + 1}</span>
                        {c.label}
                      </div>
                      <div className="small muted" style={{ marginTop: '2px', marginLeft: '26px' }}>
                        Current votes: <strong>{votes}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-small btn-icon"
                        onClick={() => reorderCandidate(currentElection.id, c.id, 'up')}
                        disabled={idx === 0}
                        title="Move candidate up on ballot"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-small btn-icon"
                        onClick={() => reorderCandidate(currentElection.id, c.id, 'down')}
                        disabled={idx === currentElection.candidates.length - 1}
                        title="Move candidate down on ballot"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => handleRemove(c)}
                        title="Remove candidate"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
