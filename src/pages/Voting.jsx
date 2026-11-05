import React from 'react';
import { Vote, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { formatDate, formatCountdown } from '../utils/helpers';

export default function Voting() {
  const { currentUser } = useAuth();
  const { elections, castVote, hasVoted, showConfirmation } = useApp();

  const activeElections = elections.filter((e) => e.active);

  const handleVoteClick = (election, candidate) => {
    showConfirmation({
      title: 'Confirm Your Vote',
      message: `You are about to cast your official ballot for "${candidate.label}" in the "${election.title}". This action is final and cannot be altered or repeated.`,
      confirmText: 'Submit Ballot',
      danger: false,
      onConfirm: () => {
        castVote(election.id, candidate.id, currentUser);
      }
    });
  };

  return (
    <div>
      <div className="card">
        <div className="flex items-center gap-3">
          <Vote size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h2>Official Voting Booth</h2>
            <p className="muted small">Cast your ballot in active elections. One vote per registered user is strictly enforced.</p>
          </div>
        </div>
      </div>

      {activeElections.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={36} style={{ color: 'var(--muted)', margin: '0 auto 12px' }} />
          <h3>No Active Elections</h3>
          <p className="muted" style={{ marginTop: '6px' }}>
            There are currently no open elections available for voting. Check back later or contact an administrator.
          </p>
        </div>
      ) : (
        activeElections.map((election) => {
          const userVoted = hasVoted(election.id, currentUser.id);
          const countdown = election.ends ? formatCountdown(election.ends) : null;
          const candidates = election.candidates || [];

          return (
            <div key={election.id} className="card" style={{ marginBottom: '16px' }}>
              <div className="flex items-center justify-between row-responsive" style={{ marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px' }}>{election.title}</h3>
                  <div className="small muted" style={{ marginTop: '4px' }}>
                    Status: <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active</span>
                    {election.ends && ` • Ends: ${formatDate(election.ends)}`}
                    {countdown && !countdown.expired && (
                      <span style={{ marginLeft: '8px', color: 'var(--accent)', fontWeight: 600 }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        {countdown.text}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {userVoted ? (
                    <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '13px' }}>
                      <CheckCircle2 size={14} style={{ marginRight: '6px' }} />
                      Ballot Already Submitted
                    </span>
                  ) : (
                    <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                      Eligible to Vote
                    </span>
                  )}
                </div>
              </div>

              {userVoted && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--success-light)',
                    color: 'var(--success)',
                    fontSize: '13px',
                    fontWeight: 500,
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>You have already cast your ballot in this election. Thank you for participating!</span>
                </div>
              )}

              {/* Candidates */}
              {candidates.length === 0 ? (
                <div className="muted small" style={{ padding: '16px 0' }}>
                  No candidates have been registered for this election yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {candidates.map((c) => {
                    const votes = election.votes?.[c.id] || 0;
                    return (
                      <div key={c.id} className="list-item" style={{ padding: '14px 18px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '15px' }}>{c.label}</div>
                          <div className="small muted" style={{ marginTop: '2px' }}>
                            Current Tally: <strong>{votes}</strong> {votes === 1 ? 'vote' : 'votes'}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={userVoted}
                          onClick={() => handleVoteClick(election, c)}
                          style={{ minWidth: '100px' }}
                        >
                          <Vote size={15} />
                          <span>{userVoted ? 'Voted' : 'Vote'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
