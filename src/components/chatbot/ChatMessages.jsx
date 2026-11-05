import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

export default function ChatMessages({ messages, isTyping, onNavigate }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="votebot-messages">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} onNavigate={onNavigate} />
      ))}

      {isTyping && <TypingIndicator />}

      <div ref={bottomRef} style={{ height: '1px' }} />
    </div>
  );
}
