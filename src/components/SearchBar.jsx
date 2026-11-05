import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { users, elections, showToast } = useApp();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    // Search elections first
    const matchedElection = elections.find((el) =>
      el.title.toLowerCase().includes(q)
    );

    if (matchedElection) {
      showToast(`Found election: "${matchedElection.title}"`, 'info');
      setQuery('');
      navigate('/results');
      return;
    }

    // Search users if admin or for account lookup
    const matchedUser = users.find(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );

    if (matchedUser) {
      if (isAdmin) {
        showToast(`Found user: ${matchedUser.name} (${matchedUser.email})`, 'info');
        setQuery('');
        navigate('/users');
      } else {
        showToast(`User found: ${matchedUser.name}`, 'info');
        setQuery('');
      }
      return;
    }

    showToast('No matching elections or users found.', 'info');
  };

  return (
    <form onSubmit={handleSearch} style={{ position: 'relative', width: '240px' }}>
      <input
        type="text"
        placeholder="Search users or elections..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          paddingLeft: '34px',
          paddingRight: '12px',
          paddingTop: '6px',
          paddingBottom: '6px',
          fontSize: '13px',
          borderRadius: 'var(--radius-sm)'
        }}
        aria-label="Search"
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
    </form>
  );
}
