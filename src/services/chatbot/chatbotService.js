/**
 * VoteBot Coordinator Service
 * Coordinates intent detection and response generation.
 */

import { detectIntent } from './intentDetector';
import { responseGenerator } from './responseGenerator';
import { uid } from '../../utils/helpers';

export const chatbotService = {
  /**
   * Process a user query and produce a structured bot message
   */
  async processUserMessage(queryText, currentUser) {
    // Intent detection
    const intentResult = detectIntent(queryText);

    // Response generation with live application data
    const responsePayload = responseGenerator.generateResponse(intentResult, currentUser);

    return {
      id: uid('msg'),
      sender: 'bot',
      content: responsePayload.text,
      timestamp: Date.now(),
      type: responsePayload.type || 'text',
      navigation: responsePayload.navigation || null,
      quickReplies: responsePayload.quickReplies || []
    };
  },

  /**
   * Generate role-tailored initial greeting
   */
  getInitialWelcomeMessage(currentUser) {
    const isAdmin = currentUser?.role === 'admin';
    const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'there';

    if (isAdmin) {
      return {
        id: 'welcome_msg',
        sender: 'bot',
        content: `Hello, **${userName}**! I'm **VoteBot**, your administrative virtual assistant. I can assist you with election setups, candidate configuration, user administration, and system navigation.`,
        timestamp: Date.now(),
        type: 'text',
        quickReplies: [
          'How do I create an election?',
          'Show active elections',
          'How do I manage users?',
          'How do I export CSV?',
          'How do I view audit logs?'
        ]
      };
    }

    return {
      id: 'welcome_msg',
      sender: 'bot',
      content: `Hello, **${userName}**! Welcome to MyVote. I'm **VoteBot**, your smart voting assistant. I can help you explore elections, understand voting procedures, check deadlines, and navigate the platform.`,
      timestamp: Date.now(),
      type: 'text',
      quickReplies: [
        'How do I vote?',
        'Show active elections',
        'How can I view results?',
        'What are the voting rules?',
        'Open my profile'
      ]
    };
  }
};
