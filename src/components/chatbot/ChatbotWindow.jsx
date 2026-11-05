import React from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import QuickReplies from './QuickReplies';
import ChatInput from './ChatInput';

export default function ChatbotWindow({
  isOpen,
  isMinimized,
  messages,
  isTyping,
  onMinimize,
  onClose,
  onClearChat,
  onSendMessage,
  onNavigate
}) {
  if (!isOpen) return null;

  // Extract latest quick replies from the most recent bot message
  const lastBotMessage = [...messages].reverse().find((m) => m.sender === 'bot');
  const activeQuickReplies = lastBotMessage?.quickReplies || [];

  return (
    <div
      className={`votebot-window ${isMinimized ? 'minimized' : ''}`}
      role="region"
      aria-label="VoteBot Assistant"
    >
      <ChatHeader
        isMinimized={isMinimized}
        onMinimize={onMinimize}
        onClose={onClose}
        onClearChat={onClearChat}
      />

      {!isMinimized && (
        <>
          <ChatMessages
            messages={messages}
            isTyping={isTyping}
            onNavigate={onNavigate}
          />

          <QuickReplies
            suggestions={activeQuickReplies}
            onSelect={onSendMessage}
            disabled={isTyping}
          />

          <ChatInput
            onSendMessage={onSendMessage}
            disabled={isTyping}
          />
        </>
      )}
    </div>
  );
}
