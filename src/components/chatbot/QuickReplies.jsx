import React from 'react';

export default function QuickReplies({ suggestions, onSelect, disabled }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="votebot-quick-replies" role="group" aria-label="Suggested quick replies">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          type="button"
          className="votebot-qr-btn"
          disabled={disabled}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
