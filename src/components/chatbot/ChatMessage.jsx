import React from 'react';
import { ArrowRight, Bot, User } from 'lucide-react';

export default function ChatMessage({ message, onNavigate }) {
  const isUser = message.sender === 'user';

  // Helper to format simple markdown-like text with bold and bullet points
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} style={{ height: '6px' }} />;
      }

      // Convert **text** to <strong>text</strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '3px' }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      return (
        <div key={idx} style={{ margin: '2px 0' }}>
          {formattedParts}
        </div>
      );
    });
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`votebot-msg-row ${isUser ? 'user' : 'bot'}`}>
      <div className="votebot-msg-bubble">
        {renderFormattedContent(message.content)}

        {/* Clickable Navigation Card */}
        {message.navigation && onNavigate && (
          <div
            className="votebot-nav-card"
            onClick={() => onNavigate(message.navigation.path)}
            title={`Navigate to ${message.navigation.label}`}
          >
            <span>{message.navigation.label}</span>
            <ArrowRight size={15} />
          </div>
        )}

        <div className="votebot-msg-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}
