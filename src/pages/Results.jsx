import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Users, Vote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CanvasBarChart from '../components/CanvasBarChart';
import { formatDate } from '../utils/helpers';

export default function Results() {
  const { elections } = useApp();
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'closed'

  const filteredElections = elections.filter((el) => {
    if (filter === 'active') return el.active;
    if (filter === 'closed') return !el.active;
    return true;
  });

  return (
    <div>
      <div className="card">
        <div className="flex items-center justify-between row-responsive">
          <div className="flex items-center gap-3">
            <BarChart3 size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <h2>Results & Analytics</h2>
              <p className="muted small">Live graphical visualizations and candidate percentage tallies</p>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className={`btn btn-small ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter('all')}
            >
              All ({elections.length})
            </button>
            <button
              type="button"
              className={`btn btn-small ${filter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              type="button"
              className={`btn btn-small ${filter === 'closed' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter('closed')}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {filteredElections.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p className="muted">No elections found matching the selected filter.</p>
        </div>
      ) : (
        filteredElections.map((election) => {
          const totalVotes = Object.values(election.votes || {}).reduce(
            (sum, v) => sum + (Number(v) || 0),
            0
          );
          const candidates = election.candidates || [];

          // Find leader
          let leadingCandidate = null;
          let highestVotes = -1;
          candidates.forEach((c) => {
            const v = Number(election.votes?.[c.id]) || 0;
            if (v > highestVotes) {
              highestVotes = v;
              leadingCandidate = c;
            }
          });

          return (
            <div key={election.id} className="card" style={{ marginBottom: '20px' }}>
              <div className="flex items-center justify-between row-responsive" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 style={{ fontSize: '18px' }}>{election.title}</h3>
                    <span className={`badge ${election.active ? 'badge-success' : 'badge-muted'}`}>
                      {election.active ? 'Active Ballot' : 'Closed'}
                    </span>
                  </div>
                  <div className="small muted" style={{ marginTop: '4px' }}>
                    Total Ballots Cast: <strong>{totalVotes}</strong>
                    {election.ends && ` • Scheduled close: ${formatDate(election.ends)}`}
                  </div>
                </div>

                {leadingCandidate && highestVotes > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="small muted">Current Leader:</span>
                    <span className="badge badge-primary">
                      {leadingCandidate.label} ({highestVotes} votes)
                    </span>
                  </div>
                )}
              </div>

              {/* Canvas Horizontal Bar Chart */}
              <div style={{ marginTop: '16px' }}>
                <CanvasBarChart election={election} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
