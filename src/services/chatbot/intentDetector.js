/**
 * VoteBot - Smart Rule-Based Intent Detector
 * Normalizes text, matches keywords, synonyms, and phrase patterns, and calculates intent scores.
 */

// Text Normalizer: lowercase, expand common contractions, remove punctuation
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  let str = text.toLowerCase().trim();

  // Expand contractions
  const contractions = {
    "i'm": "i am",
    "what's": "what is",
    "how's": "how is",
    "it's": "it is",
    "can't": "cannot",
    "don't": "do not",
    "won't": "will not",
    "where's": "where is",
    "let's": "let us",
    "who's": "who is",
    "there's": "there is",
    "you're": "you are"
  };

  for (const [contraction, expansion] of Object.entries(contractions)) {
    str = str.replaceAll(contraction, expansion);
  }

  // Remove punctuation except alphanumeric and spaces
  str = str.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim();
  return str;
}

// Intent rules with keywords, phrases, and regex patterns
const INTENT_RULES = [
  // 1. Navigation Intents (High Priority)
  {
    intent: 'OPEN_DASHBOARD',
    priority: 15,
    phrases: [
      'open dashboard', 'take me to dashboard', 'go to dashboard', 'show dashboard',
      'home page', 'main page', 'return to dashboard'
    ],
    keywords: ['dashboard']
  },
  {
    intent: 'OPEN_VOTING',
    priority: 15,
    phrases: [
      'open voting', 'take me to voting', 'go to voting', 'take me to vote', 'open ballot',
      'voting booth', 'voting page', 'show voting', 'go to vote now', 'i want to vote now'
    ],
    patterns: [/\b(go to|take me to|open|navigate to)\s+(voting|vote|ballot)\b/]
  },
  {
    intent: 'OPEN_RESULTS',
    priority: 15,
    phrases: [
      'open results', 'take me to results', 'go to results', 'show results',
      'view results', 'results page', 'results and analytics', 'analytics page'
    ],
    patterns: [/\b(go to|take me to|open|show|view)\s+(results|analytics|chart|charts)\b/]
  },
  {
    intent: 'OPEN_PROFILE',
    priority: 15,
    phrases: [
      'open my profile', 'view my profile', 'show my profile', 'go to profile',
      'my profile', 'user profile'
    ],
    patterns: [/\b(open|view|show|go to)\s+(my\s+)?profile\b/]
  },
  {
    intent: 'OPEN_SETTINGS',
    priority: 14,
    phrases: [
      'open settings', 'go to settings', 'take me to settings', 'show settings',
      'application settings', 'preferences'
    ],
    keywords: ['settings']
  },
  {
    intent: 'OPEN_USERS',
    priority: 15,
    phrases: [
      'open user management', 'go to user management', 'open users', 'show user directory',
      'take me to users', 'user list'
    ],
    patterns: [/\b(open|go to|take me to|show)\s+(user management|users|user list)\b/]
  },
  {
    intent: 'OPEN_ELECTIONS',
    priority: 15,
    phrases: [
      'open election management', 'go to elections', 'open elections', 'take me to elections',
      'manage elections page'
    ],
    patterns: [/\b(open|go to|take me to)\s+(election management|elections)\b/]
  },
  {
    intent: 'OPEN_AUDIT',
    priority: 15,
    phrases: [
      'open audit logs', 'go to audit', 'show audit logs', 'take me to audit log',
      'view audit log', 'system logs'
    ],
    patterns: [/\b(open|go to|take me to|show|view)\s+(audit|audit logs|logs)\b/]
  },

  // 2. Voting Intents
  {
    intent: 'VOTING_PROCESS',
    priority: 12,
    phrases: [
      'how can i vote', 'how do i vote', 'tell me the voting procedure',
      'i want to cast my vote', 'where do i vote', 'how to vote', 'how to cast ballot',
      'voting steps', 'voting process', 'guide me to vote', 'how does voting work'
    ],
    patterns: [
      /\bhow\s+(can|do|should)\s+i\s+vote\b/,
      /\b(voting procedure|voting steps|cast my vote|cast a vote|cast ballot)\b/
    ],
    keywords: ['vote', 'voting', 'procedure', 'ballot', 'cast']
  },
  {
    intent: 'ONE_VOTE_RULE',
    priority: 13,
    phrases: [
      'can i vote twice', 'can i vote again', 'can i change my vote', 'one vote rule',
      'multiple votes', 'vote multiple times', 'change candidate after voting'
    ],
    patterns: [
      /\b(vote twice|vote again|change my vote|vote multiple times|vote more than once)\b/
    ]
  },
  {
    intent: 'ALREADY_VOTED',
    priority: 12,
    phrases: [
      'i already voted', 'why is my vote disabled', 'already cast ballot',
      'it says already voted', 'button says voted'
    ],
    patterns: [/\b(already voted|already cast|button is disabled)\b/]
  },
  {
    intent: 'VOTING_ELIGIBILITY',
    priority: 11,
    phrases: [
      'am i eligible to vote', 'who can vote', 'voting requirements',
      'voter eligibility', 'can everyone vote'
    ],
    patterns: [/\b(eligible to vote|eligibility|who can vote)\b/]
  },
  {
    intent: 'VOTING_DISABLED',
    priority: 11,
    phrases: [
      'why is voting button disabled', 'vote button disabled', 'cannot click vote',
      'why can i not vote', 'vote button grayed out'
    ],
    patterns: [/\b(vote|voting)\b.*\b(disabled|gray|grey|cannot click|not working)\b/]
  },

  // 3. Dynamic Election Queries
  {
    intent: 'ACTIVE_ELECTIONS',
    priority: 12,
    phrases: [
      'show me active elections', 'what elections are active', 'show active elections',
      'which elections are open', 'list active elections', 'open elections right now',
      'what can i vote for', 'ongoing elections', 'active elections list'
    ],
    patterns: [
      /\b(active|open|ongoing|current)\s+elections\b/,
      /\bwhat\s+elections\s+are\s+(active|open|running)\b/
    ]
  },
  {
    intent: 'CLOSED_ELECTIONS',
    priority: 11,
    phrases: [
      'show closed elections', 'past elections', 'completed elections',
      'expired elections', 'finished elections', 'which elections ended'
    ],
    patterns: [/\b(closed|past|expired|finished|completed|ended)\s+elections\b/]
  },
  {
    intent: 'UPCOMING_ELECTIONS',
    priority: 10,
    phrases: [
      'upcoming elections', 'scheduled elections', 'future elections',
      'when is the next election'
    ],
    patterns: [/\b(upcoming|future|next)\s+elections?\b/]
  },
  {
    intent: 'ELECTION_COUNT',
    priority: 12,
    phrases: [
      'how many elections are there', 'how many active elections are there',
      'number of elections', 'count of elections', 'how many elections'
    ],
    patterns: [/\bhow many\s+(active\s+)?elections\b/, /\bcount of elections\b/]
  },
  {
    intent: 'CANDIDATE_COUNT',
    priority: 12,
    phrases: [
      'how many candidates are participating', 'how many candidates', 'number of candidates',
      'candidate count', 'total candidates', 'who is running'
    ],
    patterns: [/\bhow many candidates\b/, /\b(number|count) of candidates\b/]
  },
  {
    intent: 'ELECTION_DEADLINE',
    priority: 12,
    phrases: [
      'when does the election close', 'when does election end', 'election deadline',
      'election closing time', 'how much time is left', 'countdown timer', 'when does it end'
    ],
    patterns: [
      /\bwhen does (the )?election (close|end)\b/,
      /\b(deadline|closing time|how much time left)\b/
    ]
  },
  {
    intent: 'ELECTION_RESULTS',
    priority: 11,
    phrases: [
      'how to see results', 'who is winning', 'current election results',
      'election standing', 'vote counts', 'who is leading', 'live results'
    ],
    patterns: [
      /\b(who is (winning|leading)|see results|view results|election standing|chart results)\b/
    ]
  },
  {
    intent: 'ELECTION_DETAILS',
    priority: 10,
    phrases: [
      'election details', 'tell me about elections', 'election information',
      'election summary'
    ],
    patterns: [/\belection (details|info|information|summary)\b/]
  },

  // 4. Authentication Intents
  {
    intent: 'CHANGE_PASSWORD',
    priority: 11,
    phrases: [
      'how to change password', 'change my password', 'reset my password',
      'update password', 'where do i change password'
    ],
    patterns: [/\b(change|update|reset)\s+(my\s+)?password\b/]
  },
  {
    intent: 'FORGOT_PASSWORD',
    priority: 11,
    phrases: [
      'forgot password', 'i forgot my password', 'lost password',
      'cannot remember password', 'how to recover password'
    ],
    patterns: [/\b(forgot|lost|recover|remember)\s+(my\s+)?password\b/]
  },
  {
    intent: 'REGISTRATION',
    priority: 10,
    phrases: [
      'how to register', 'how to signup', 'create account', 'registration steps',
      'new account'
    ],
    patterns: [/\b(how to (register|sign up)|create (an )?account)\b/]
  },
  {
    intent: 'LOGIN_HELP',
    priority: 10,
    phrases: [
      'how to login', 'how to sign in', 'login credentials', 'demo credentials',
      'login help', 'cannot login'
    ],
    patterns: [/\b(how to (login|sign in)|demo credentials)\b/]
  },

  // 5. Admin Intents
  {
    intent: 'CREATE_ELECTION_HELP',
    priority: 13,
    phrases: [
      'how to create an election', 'how do i create an election', 'create election guide',
      'how to start an election', 'add new election', 'keyboard shortcut n'
    ],
    patterns: [/\bhow (do i|to) create (an? )?election\b/, /\b(create|add|new) election\b/]
  },
  {
    intent: 'ADD_CANDIDATE_HELP',
    priority: 13,
    phrases: [
      'how to add candidates', 'how do i add candidates', 'add candidate to election',
      'reorder candidates', 'move candidates up and down', 'candidate management'
    ],
    patterns: [/\bhow (do i|to) add (a )?candidate\b/, /\b(add|reorder) candidate\b/]
  },
  {
    intent: 'USER_MANAGEMENT_HELP',
    priority: 13,
    phrases: [
      'how to manage users', 'how do i manage users', 'how to add users',
      'change user password as admin', 'delete user', 'edit user role'
    ],
    patterns: [/\bhow (do i|to) (manage|add|edit|delete) users?\b/]
  },
  {
    intent: 'CSV_EXPORT_HELP',
    priority: 12,
    phrases: [
      'how to export csv', 'how do i export data', 'download backup',
      'export application data', 'csv backup'
    ],
    patterns: [/\b(export (data|csv)|download backup)\b/]
  },
  {
    intent: 'CSV_IMPORT_HELP',
    priority: 12,
    phrases: [
      'how to import csv', 'how do i import data', 'upload backup',
      'restore csv data', 'import backup file'
    ],
    patterns: [/\b(import (data|csv)|upload backup|restore csv)\b/]
  },
  {
    intent: 'AUDIT_LOG_HELP',
    priority: 12,
    phrases: [
      'how to view audit logs', 'what are audit logs', 'how do audit logs work',
      'security trail', 'audit trail explanation'
    ],
    patterns: [/\b(what are|view|check|see) audit logs?\b/, /\baudit trail\b/]
  },
  {
    intent: 'ELECTION_ACTIVATION_HELP',
    priority: 12,
    phrases: [
      'how to activate election', 'how to deactivate election', 'activate election button',
      'auto close election'
    ],
    patterns: [/\b(activate|deactivate|close) election\b/]
  },

  // 6. General Intents
  {
    intent: 'GREETING',
    priority: 8,
    phrases: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy'],
    patterns: [/^(hi|hello|hey|greetings|good (morning|afternoon|evening))\b/]
  },
  {
    intent: 'GOODBYE',
    priority: 8,
    phrases: ['bye', 'goodbye', 'see you later', 'farewell', 'talk to you later'],
    patterns: [/^(bye|goodbye|see you|farewell)\b/]
  },
  {
    intent: 'THANK_YOU',
    priority: 8,
    phrases: ['thank you', 'thanks', 'thanks a lot', 'appreciate it', 'thank you so much'],
    patterns: [/\b(thank you|thanks|appreciate it)\b/]
  },
  {
    intent: 'HELP',
    priority: 7,
    phrases: ['help', 'what can you do', 'how can you help me', 'assistance', 'features', 'i need help'],
    patterns: [/^(help|what can you do|i need help)\b/]
  },
  {
    intent: 'ABOUT_MYVOTE',
    priority: 9,
    phrases: [
      'what is myvote', 'about myvote', 'who built this', 'what does this app do',
      'tell me about this system', 'security features'
    ],
    patterns: [/\b(what is myvote|about myvote|tell me about myvote)\b/]
  }
];

/**
 * Detect the intent from a normalized query
 * @param {string} userQuery
 * @returns {{ intent: string, confidence: number, matchedPhrase: string|null }}
 */
export function detectIntent(userQuery) {
  const normalized = normalizeText(userQuery);
  if (!normalized) {
    return { intent: 'UNKNOWN_QUERY', confidence: 0, matchedPhrase: null };
  }

  let bestMatch = null;
  let highestScore = 0;

  for (const rule of INTENT_RULES) {
    let score = 0;
    let matchedPhrase = null;

    // Check exact phrase matches (Highest precision)
    if (rule.phrases) {
      for (const phrase of rule.phrases) {
        if (normalized === phrase) {
          score = 100 + (rule.priority || 0);
          matchedPhrase = phrase;
          break;
        } else if (normalized.includes(phrase)) {
          score = Math.max(score, 75 + (rule.priority || 0));
          matchedPhrase = phrase;
        }
      }
    }

    // Check regex pattern matches
    if (rule.patterns) {
      for (const pattern of rule.patterns) {
        if (pattern.test(normalized)) {
          score = Math.max(score, 80 + (rule.priority || 0));
          break;
        }
      }
    }

    // Check keyword frequency
    if (rule.keywords) {
      const words = normalized.split(/\s+/);
      let keywordHits = 0;
      for (const kw of rule.keywords) {
        if (words.includes(kw)) keywordHits++;
      }
      if (keywordHits > 0) {
        const keywordScore = (keywordHits / rule.keywords.length) * 50 + (rule.priority || 0);
        score = Math.max(score, keywordScore);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        intent: rule.intent,
        confidence: score,
        matchedPhrase
      };
    }
  }

  // Threshold check: If confidence is too low (< 35), return UNKNOWN_QUERY
  if (!bestMatch || highestScore < 35) {
    return {
      intent: 'UNKNOWN_QUERY',
      confidence: highestScore,
      matchedPhrase: null
    };
  }

  return bestMatch;
}
