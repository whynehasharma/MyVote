import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="votebot-input-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="votebot-input"
        placeholder={disabled ? 'VoteBot is replying...' : 'Ask VoteBot a question...'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={300}
      />
      <button
        type="submit"
        className="votebot-send-btn"
        disabled={!text.trim() || disabled}
        title="Send message"
        aria-label="Send message"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
