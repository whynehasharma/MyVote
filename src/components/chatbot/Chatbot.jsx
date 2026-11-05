import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatbot } from '../../hooks/useChatbot';
import ChatbotButton from './ChatbotButton';
import ChatbotWindow from './ChatbotWindow';
import './Chatbot.css';

export default function Chatbot() {
  const navigate = useNavigate();
  const {
    isOpen,
    isMinimized,
    isTyping,
    hasUnread,
    messages,
    toggleOpen,
    toggleMinimize,
    sendMessage,
    clearChat
  } = useChatbot();

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
      // Auto-minimize on smaller screens so the user can interact with the page
      if (window.innerWidth < 768) {
        toggleMinimize();
      }
    }
  };

  return (
    <>
      <ChatbotButton
        onClick={toggleOpen}
        isOpen={isOpen}
        hasUnread={hasUnread}
      />

      <ChatbotWindow
        isOpen={isOpen}
        isMinimized={isMinimized}
        messages={messages}
        isTyping={isTyping}
        onMinimize={toggleMinimize}
        onClose={toggleOpen}
        onClearChat={clearChat}
        onSendMessage={sendMessage}
        onNavigate={handleNavigate}
      />
    </>
  );
}
