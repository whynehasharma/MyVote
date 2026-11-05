/**
 * Chat History Service for VoteBot
 * Persists user conversation history in LocalStorage under ov:chat_history:<userId>
 */

const HISTORY_PREFIX = 'ov:chat_history:';
const MAX_HISTORY_MESSAGES = 100;

export const chatHistoryService = {
  getKey(userId) {
    if (!userId) return null;
    return `${HISTORY_PREFIX}${userId}`;
  },

  getHistory(userId) {
    const key = this.getKey(userId);
    if (!key) return [];

    try {
      const data = localStorage.getItem(key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.slice(-MAX_HISTORY_MESSAGES);
      }
      return [];
    } catch (e) {
      console.warn(`[chatHistoryService] Failed to load chat history for user ${userId}:`, e);
      return [];
    }
  },

  saveHistory(userId, messages) {
    const key = this.getKey(userId);
    if (!key || !Array.isArray(messages)) return;

    try {
      // Retain latest 100 messages only
      const trimmed = messages.slice(-MAX_HISTORY_MESSAGES);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (e) {
      console.error(`[chatHistoryService] Failed to save chat history for user ${userId}:`, e);
    }
  },

  clearHistory(userId) {
    const key = this.getKey(userId);
    if (!key) return;

    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`[chatHistoryService] Failed to clear chat history for user ${userId}:`, e);
    }
  }
};
