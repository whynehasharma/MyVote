import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="votebot-msg-row bot">
      <div className="votebot-typing-bubble" aria-label="VoteBot is typing">
        <span className="votebot-dot" />
        <span className="votebot-dot" />
        <span className="votebot-dot" />
      </div>
    </div>
  );
}
