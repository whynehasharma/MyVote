/**
 * Response Generator for VoteBot
 * Generates dynamic, context-aware, role-gated responses querying live application state.
 */

import { storageService } from '../storageService';
import { CHATBOT_KNOWLEDGE } from './chatbotKnowledge';
import { navigationService } from './navigationService';
import { formatDate, formatCountdown } from '../../utils/helpers';

export const responseGenerator = {
  /**
   * Main response generation method
   */
  generateResponse(intentResult, user) {
    const { intent } = intentResult;
    const role = user?.role || 'voter';
    const isAdmin = role === 'admin';
    const userName = user?.name ? user.name.split(' ')[0] : 'there';

    // 1. Navigation Intents
    if (intent.startsWith('OPEN_')) {
      const nav = navigationService.resolveNavigation(intent, role);
      if (!nav) {
        return {
          text: "I couldn't resolve that page destination. Please use the sidebar to navigate.",
          type: 'text'
        };
      }

      if (!nav.allowed) {
        return {
          text: `⚠️ **Access Restricted**: ${nav.reason}\n\nAs a registered voter, you can access your personal Dashboard, active voting booths, and public election results.`,
          type: 'text',
          quickReplies: ['Show active elections', 'View results', 'Dashboard']
        };
      }

      return {
        text: `Taking you to **${nav.label}**... Click the card below if you are not automatically redirected:`,
        type: 'navigation',
        navigation: {
          path: nav.path,
          label: `Go to ${nav.label}`
        },
        quickReplies: isAdmin
          ? ['Elections', 'Users', 'Audit Logs']
          : ['Active elections', 'Results', 'My Profile']
      };
    }

    // 2. Dynamic Election Information Intents
    const elections = storageService.getElections() || [];
    const activeElections = elections.filter((e) => e.active);
    const closedElections = elections.filter((e) => !e.active);

    switch (intent) {
      case 'ACTIVE_ELECTIONS': {
        if (activeElections.length === 0) {
          return {
            text: `There are currently **no active elections** open for voting.\n\n${
              isAdmin ? 'You can configure and activate a new election in **Election Management**.' : 'Please check back later or contact your system administrator.'
            }`,
            type: 'text',
            navigation: isAdmin ? { path: '/elections', label: 'Create an Election' } : null,
            quickReplies: isAdmin ? ['How to create an election', 'Manage users'] : ['When is the next election?', 'View past results']
          };
        }

        let reply = `Here are the **${activeElections.length} active election(s)** currently open for voting:\n\n`;
        activeElections.forEach((el, idx) => {
          const candidateCount = el.candidates ? el.candidates.length : 0;
          const countdown = el.ends ? formatCountdown(el.ends) : null;
          reply += `${idx + 1}. **${el.title}**\n   • Candidates: ${candidateCount}\n`;
          if (el.ends) {
            reply += `   • Closes: ${formatDate(el.ends)}${countdown && !countdown.expired ? ` (${countdown.text})` : ''}\n`;
          }
        });

        reply += `\nWould you like to head to the voting booth to cast your ballot?`;
        return {
          text: reply,
          type: 'structured',
          navigation: { path: '/vote', label: 'Go to Voting Booth' },
          quickReplies: ['How do I vote?', 'How many candidates?', 'View results']
        };
      }

      case 'CLOSED_ELECTIONS': {
        if (closedElections.length === 0) {
          return {
            text: 'There are currently no closed elections. All configured elections are active or none have finished yet.',
            type: 'text',
            quickReplies: ['Show active elections', 'Election results']
          };
        }

        let reply = `There are **${closedElections.length} closed election(s)** in the system archive:\n\n`;
        closedElections.forEach((el, idx) => {
          reply += `${idx + 1}. **${el.title}** (Closed)\n`;
        });
        reply += `\nYou can review finalized vote distributions and charts on the **Results & Analytics** page.`;

        return {
          text: reply,
          type: 'structured',
          navigation: { path: '/results', label: 'View Final Results' },
          quickReplies: ['Show active elections', 'Results page']
        };
      }

      case 'ELECTION_COUNT': {
        return {
          text: `📊 **Election Inventory Summary**:\n\n• **Active Elections (Open now)**: ${activeElections.length}\n• **Closed / Archived Elections**: ${closedElections.length}\n• **Total Elections**: ${elections.length}`,
          type: 'structured',
          quickReplies: ['Show active elections', 'How do I vote?', 'Election results']
        };
      }

      case 'CANDIDATE_COUNT': {
        let totalCandidates = 0;
        elections.forEach((e) => {
          totalCandidates += e.candidates ? e.candidates.length : 0;
        });

        if (elections.length === 0) {
          return {
            text: 'There are currently no candidates registered because no elections have been configured yet.',
            type: 'text'
          };
        }

        let breakdown = `There are **${totalCandidates} total candidate(s)** across all ${elections.length} election(s):\n\n`;
        elections.forEach((el) => {
          const count = el.candidates ? el.candidates.length : 0;
          breakdown += `• **${el.title}**: ${count} candidate(s) (${el.active ? 'Active' : 'Closed'})\n`;
        });

        return {
          text: breakdown,
          type: 'structured',
          quickReplies: ['Show active elections', 'How do I vote?', 'Results']
        };
      }

      case 'ELECTION_DEADLINE': {
        const electionsWithDeadlines = activeElections.filter((e) => Boolean(e.ends));
        if (electionsWithDeadlines.length === 0) {
          return {
            text: 'None of the currently active elections have a scheduled closing deadline. They remain open until manually closed by an administrator.',
            type: 'text',
            quickReplies: ['Show active elections', 'How do I vote?']
          };
        }

        let deadlineText = `⏳ **Active Election Deadlines & Countdowns**:\n\n`;
        electionsWithDeadlines.forEach((el) => {
          const cd = formatCountdown(el.ends);
          deadlineText += `• **${el.title}**:\n  - Closes on: **${formatDate(el.ends)}**\n  - Remaining: **${cd ? cd.text : 'Closed'}**\n`;
        });

        deadlineText += `\n*When the timer reaches zero, the election automatically deactivates and logs a system audit record.*`;
        return {
          text: deadlineText,
          type: 'structured',
          navigation: { path: '/vote', label: 'Vote Before Deadline' },
          quickReplies: ['Show active elections', 'How do I vote?']
        };
      }

      case 'ELECTION_RESULTS': {
        return {
          text: `You can view live interactive horizontal bar charts, vote counts, and calculated percentages on the **Results & Analytics** page anytime!`,
          type: 'navigation',
          navigation: { path: '/results', label: 'Open Results & Analytics' },
          quickReplies: ['Show active elections', 'How many elections?']
        };
      }

      case 'ELECTION_DETAILS': {
        if (elections.length === 0) {
          return {
            text: 'There are no elections in the database right now.',
            type: 'text'
          };
        }

        let summary = `📋 **Current Elections Overview**:\n\n`;
        elections.forEach((el) => {
          const votesCast = Object.values(el.votes || {}).reduce((s, v) => s + (Number(v) || 0), 0);
          summary += `• **${el.title}** (${el.active ? '🟢 Active' : '🔴 Closed'})\n  - Candidates: ${el.candidates?.length || 0} | Votes cast: ${votesCast}\n`;
        });

        return {
          text: summary,
          type: 'structured',
          quickReplies: ['Show active elections', 'How to vote?', 'Results']
        };
      }

      // 3. Admin-Specific Actions Gated by Role
      case 'CREATE_ELECTION_HELP':
      case 'ADD_CANDIDATE_HELP':
      case 'USER_MANAGEMENT_HELP':
      case 'CSV_EXPORT_HELP':
      case 'CSV_IMPORT_HELP':
      case 'AUDIT_LOG_HELP':
      case 'ELECTION_ACTIVATION_HELP': {
        if (!isAdmin) {
          return {
            text: `⚠️ **Administrator Feature**: This operation requires administrator privileges.\n\nAs an official voter, you have full access to participate in active ballots, review candidate profiles, inspect election results, and manage your personal profile credentials.`,
            type: 'text',
            quickReplies: ['How do I vote?', 'Show active elections', 'View results', 'My Profile']
          };
        }

        const knowledge = CHATBOT_KNOWLEDGE[intent];
        let navTarget = null;
        if (intent === 'CREATE_ELECTION_HELP' || intent === 'ELECTION_ACTIVATION_HELP') {
          navTarget = { path: '/elections', label: 'Open Election Management' };
        } else if (intent === 'ADD_CANDIDATE_HELP') {
          navTarget = { path: '/candidates', label: 'Open Candidate Setup' };
        } else if (intent === 'USER_MANAGEMENT_HELP') {
          navTarget = { path: '/users', label: 'Open User Management' };
        } else if (intent === 'AUDIT_LOG_HELP') {
          navTarget = { path: '/audit', label: 'Open Audit Logs' };
        } else if (intent.includes('CSV')) {
          navTarget = { path: '/settings', label: 'Open Data Management' };
        }

        return {
          text: knowledge?.text || 'Here is the administrative guide for this feature.',
          type: 'structured',
          navigation: navTarget,
          quickReplies: ['Election management', 'User management', 'Audit logs', 'Export CSV']
        };
      }

      // 4. Voting Knowledge Intents
      case 'VOTING_PROCESS':
        return {
          text: CHATBOT_KNOWLEDGE.VOTING_PROCESS.text,
          type: 'structured',
          navigation: { path: '/vote', label: 'Proceed to Voting Booth' },
          quickReplies: ['Can I vote twice?', 'Show active elections', 'View results']
        };

      case 'ONE_VOTE_RULE':
        return {
          text: CHATBOT_KNOWLEDGE.ONE_VOTE_RULE.text,
          type: 'text',
          quickReplies: ['How do I vote?', 'Why is voting button disabled?', 'View results']
        };

      case 'ALREADY_VOTED':
        return {
          text: CHATBOT_KNOWLEDGE.ALREADY_VOTED.text,
          type: 'text',
          navigation: { path: '/results', label: 'Inspect Live Results' },
          quickReplies: ['Can I vote in another election?', 'Results']
        };

      case 'VOTING_ELIGIBILITY':
        return {
          text: CHATBOT_KNOWLEDGE.VOTING_ELIGIBILITY.text,
          type: 'text',
          quickReplies: ['How do I vote?', 'Show active elections']
        };

      case 'VOTING_DISABLED':
        return {
          text: CHATBOT_KNOWLEDGE.VOTING_DISABLED.text,
          type: 'text',
          quickReplies: ['Show active elections', 'When does election close?']
        };

      // 5. Authentication Knowledge Intents
      case 'CHANGE_PASSWORD':
        return {
          text: CHATBOT_KNOWLEDGE.CHANGE_PASSWORD.text,
          type: 'structured',
          navigation: { path: '/settings', label: 'Go to Change Password' },
          quickReplies: ['Forgot password', 'My Profile']
        };

      case 'FORGOT_PASSWORD':
        return {
          text: CHATBOT_KNOWLEDGE.FORGOT_PASSWORD.text,
          type: 'text',
          quickReplies: ['Change password', 'My Profile']
        };

      case 'REGISTRATION':
        return {
          text: `To register a new account on MyVote:\n\n1. Log out or open the **Create Account** page.\n2. Provide your Full Name, Email, Role (Voter or Admin), and Password (minimum 8 characters).\n3. Confirm your password.\n\nAll accounts are created with client-side PBKDF2 encryption.`,
          type: 'text',
          quickReplies: ['Login help', 'About MyVote']
        };

      case 'LOGIN_HELP':
        return {
          text: `You can sign in with your registered email and password.\n\n**Quick Demo Access**:\n• **Demo Admin**: \`admin@example.com\` / \`admin\`\n• **Demo Voter**: \`voter@example.com\` / \`voter\`\n\n1-click buttons are also available directly on the login screen.`,
          type: 'text',
          quickReplies: ['Change password', 'How do I vote?']
        };

      case 'ABOUT_MYVOTE':
        return {
          text: CHATBOT_KNOWLEDGE.ABOUT_MYVOTE.text,
          type: 'structured',
          quickReplies: ['How do I vote?', 'Show active elections', 'Security features']
        };

      // 6. Conversational Intents
      case 'GREETING':
        return {
          text: isAdmin
            ? `Hello **${userName}**! I'm **VoteBot**, your administrative virtual assistant. How can I assist you with election setups, candidates, or user management today?`
            : `Hello **${userName}**! I'm **VoteBot**, your smart voting assistant. How can I assist you with your ballot, voting rules, or election schedules today?`,
          type: 'text',
          quickReplies: isAdmin
            ? ['How do I create an election?', 'Show active elections', 'Manage users', 'View audit logs']
            : ['How do I vote?', 'Show active elections', 'What are the voting rules?', 'View results']
        };

      case 'GOODBYE':
        return {
          text: `Goodbye **${userName}**! Have a wonderful day, and thank you for participating in MyVote. Let me know if you need anything else!`,
          type: 'text',
          quickReplies: ['Help', 'Active elections']
        };

      case 'THANK_YOU':
        return {
          text: `You're very welcome, **${userName}**! It's my pleasure to assist. Let me know if you have any other questions about MyVote.`,
          type: 'text',
          quickReplies: ['How do I vote?', 'Show active elections', 'View results']
        };

      case 'HELP':
        return {
          text: isAdmin
            ? `Here is what I can help you with as an **Administrator**:\n\n• **Election Operations**: Create elections, activate/deactivate, set closing dates.\n• **Candidate Hierarchy**: Add ballot candidates and arrange display order.\n• **User Governance**: Add users, edit roles, or set new passwords.\n• **Data Management**: Export or import CSV backups.\n• **Auditing**: Review system audit trails.\n• **Navigation**: Jump directly to any dashboard section.`
            : `Here is what I can help you with as an **Official Voter**:\n\n• **Voting Assistance**: Explain ballot submission steps and eligibility.\n• **Active Elections**: Check what elections are open right now and view deadlines.\n• **Live Analytics**: View vote distribution bar charts and percentages.\n• **Security Rules**: Explain one-vote enforcement and password changes.\n• **Quick Navigation**: Jump directly to voting, results, or your profile.`,
          type: 'structured',
          quickReplies: isAdmin
            ? ['Create an election', 'Manage users', 'Export CSV', 'Audit logs']
            : ['How do I vote?', 'Show active elections', 'Can I vote twice?', 'View results']
        };

      default:
        return {
          text: `I'm not quite sure I understand your query. Could you rephrase your question, or select one of the popular topics below?`,
          type: 'text',
          quickReplies: isAdmin
            ? ['How do I create an election?', 'Show active elections', 'Manage users', 'Export CSV']
            : ['How do I vote?', 'Show active elections', 'What are the voting rules?', 'View results']
        };
    }
  }
};
