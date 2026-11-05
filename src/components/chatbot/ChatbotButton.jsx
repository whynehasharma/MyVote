import React from 'react';
import { Bot, MessageSquare } from 'lucide-react';

export default function ChatbotButton({ onClick, isOpen, hasUnread }) {
  if (isOpen) return null;

  return (
    <div className="votebot-fab-container">
      <div className="votebot-tooltip">Chat with VoteBot</div>
      <button
        type="button"
        className="votebot-fab"
        onClick={onClick}
        aria-label="Chat with VoteBot"
        title="Chat with VoteBot"
      >
        <Bot size={26} />
        {hasUnread && <span className="votebot-unread-badge" />}
      </button>
    </div>
  );
}
