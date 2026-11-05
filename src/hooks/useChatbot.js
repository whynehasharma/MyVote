import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { chatbotService } from '../services/chatbot/chatbotService';
import { chatHistoryService } from '../services/chatbot/chatHistoryService';
import { uid } from '../utils/helpers';

export function useChatbot() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState([]);

  const activeUserIdRef = useRef(currentUser?.id);

  // Initialize or swap history whenever currentUser changes
  useEffect(() => {
    activeUserIdRef.current = currentUser?.id;
    if (!currentUser) {
      setMessages([]);
      setIsOpen(false);
      setIsMinimized(false);
      return;
    }

    const saved = chatHistoryService.getHistory(currentUser.id);
    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      const initial = [chatbotService.getInitialWelcomeMessage(currentUser)];
      setMessages(initial);
      chatHistoryService.saveHistory(currentUser.id, initial);
    }
    setHasUnread(false);
  }, [currentUser]);

  // Toggle open
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setHasUnread(false);
        setIsMinimized(false);
      }
      return next;
    });
  }, []);

  // Toggle minimize
  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  // Send a user message
  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || isTyping || !currentUser) return;
      const cleanText = text.trim();

      const userMsg = {
        id: uid('msg'),
        sender: 'user',
        content: cleanText,
        timestamp: Date.now(),
        type: 'text'
      };

      setMessages((prev) => {
        const updated = [...prev, userMsg];
        chatHistoryService.saveHistory(currentUser.id, updated);
        return updated;
      });

      setIsTyping(true);

      // Natural response delay (450ms - 650ms)
      const delay = Math.floor(Math.random() * 200) + 450;
      setTimeout(async () => {
        try {
          const botMsg = await chatbotService.processUserMessage(cleanText, currentUser);

          // Verify user didn't switch during timeout
          if (activeUserIdRef.current === currentUser.id) {
            setMessages((prev) => {
              const updated = [...prev, botMsg];
              chatHistoryService.saveHistory(currentUser.id, updated);
              return updated;
            });

            if (!isOpen || isMinimized) {
              setHasUnread(true);
            }
          }
        } catch (err) {
          console.error('[useChatbot] Message error:', err);
        } finally {
          setIsTyping(false);
        }
      }, delay);
    },
    [isTyping, currentUser, isOpen, isMinimized]
  );

  // Clear chat conversation
  const clearChat = useCallback(() => {
    if (!currentUser) return;
    chatHistoryService.clearHistory(currentUser.id);
    const initial = [chatbotService.getInitialWelcomeMessage(currentUser)];
    setMessages(initial);
    chatHistoryService.saveHistory(currentUser.id, initial);
    setHasUnread(false);
  }, [currentUser]);

  return {
    isOpen,
    isMinimized,
    isTyping,
    hasUnread,
    messages,
    toggleOpen,
    toggleMinimize,
    sendMessage,
    clearChat
  };
}
