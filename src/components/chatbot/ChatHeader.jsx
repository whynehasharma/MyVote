import React from 'react';
import { Bot, Minus, X, Trash2, Maximize2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ChatHeader({ onMinimize, onClose, onClearChat, isMinimized }) {
  const { showConfirmation } = useApp();

  const handleClear = () => {
    showConfirmation({
      title: 'Clear Conversation History?',
      message: 'This will reset your conversation with VoteBot. Your stored chat history will be cleared.',
      confirmText: 'Clear Chat',
      danger: true,
      onConfirm: onClearChat
    });
  };

  return (
    <div className="votebot-header">
      <div className="votebot-header-profile">
        <div className="votebot-avatar">
          <Bot size={20} />
          <span className="votebot-status-dot" title="Online" />
        </div>
        <div>
          <div className="votebot-title">VoteBot</div>
          <div className="votebot-subtitle">MyVote Virtual Assistant</div>
        </div>
      </div>

      <div className="votebot-header-actions">
        {!isMinimized && (
          <button
            type="button"
            className="votebot-header-btn"
            onClick={handleClear}
            title="Clear conversation history"
            aria-label="Clear conversation history"
          >
            <Trash2 size={16} />
          </button>
        )}

        <button
          type="button"
          className="votebot-header-btn"
          onClick={onMinimize}
          title={isMinimized ? 'Expand chat' : 'Minimize chat'}
          aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
        </button>

        <button
          type="button"
          className="votebot-header-btn"
          onClick={onClose}
          title="Close chat"
          aria-label="Close chat"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
