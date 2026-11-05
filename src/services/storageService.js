/**
 * Centralized LocalStorage Service for MyVote Online Voting System
 * Provides structured JSON access, fallback handling, and atomic operations.
 */

export const STORAGE_KEYS = {
  USERS: 'ov:users',
  ELECTIONS: 'ov:elections',
  AUDIT: 'ov:audit',
  USER: 'ov:user',
  THEME: 'ov:theme',
  LEGACY_DATA: 'ov:data',
  VOTED_PREFIX: 'ov:voted:'
};

// Default seed data when system is initialized for the first time
const DEFAULT_USERS = [
  {
    id: 'admin',
    name: 'Administrator',
    email: 'admin@example.com',
    role: 'admin',
    password: 'admin'
  },
  {
    id: 'voter',
    name: 'Sample Voter',
    email: 'voter@example.com',
    role: 'voter',
    password: 'voter'
  }
];

const DEFAULT_ELECTIONS = [
  {
    id: 'el_sample',
    title: 'Student Council President Election 2026',
    active: true,
    ends: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
    candidates: [
      { id: 'c_1', label: 'Jane Doe (Tech & Innovation)' },
      { id: 'c_2', label: 'John Smith (Campus Culture)' },
      { id: 'c_3', label: 'Alice Walker (Student Welfare)' }
    ],
    votes: {
      c_1: 4,
      c_2: 3,
      c_3: 2
    }
  }
];

export const storageService = {
  // Generic safe get/set/remove
  getItem(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      if (val === null || val === undefined) return fallback;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`[storageService] Error parsing item for key "${key}":`, e);
      return fallback;
    }
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[storageService] Error writing item for key "${key}":`, e);
      return false;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`[storageService] Error removing item for key "${key}":`, e);
      return false;
    }
  },

  // Initialize and check legacy migration
  initStorage() {
    try {
      // Check for legacy single-key bundle 'ov:data'
      const legacy = this.getItem(STORAGE_KEYS.LEGACY_DATA, null);

      let users = this.getItem(STORAGE_KEYS.USERS, null);
      if (!users) {
        if (legacy && Array.isArray(legacy.users) && legacy.users.length > 0) {
          users = legacy.users;
        } else {
          users = DEFAULT_USERS;
        }
        this.setItem(STORAGE_KEYS.USERS, users);
      }

      let elections = this.getItem(STORAGE_KEYS.ELECTIONS, null);
      if (!elections) {
        if (legacy && Array.isArray(legacy.elections)) {
          elections = legacy.elections;
        } else {
          elections = DEFAULT_ELECTIONS;
        }
        this.setItem(STORAGE_KEYS.ELECTIONS, elections);
      }

      let audit = this.getItem(STORAGE_KEYS.AUDIT, null);
      if (!audit) {
        if (legacy && Array.isArray(legacy.audit)) {
          audit = legacy.audit;
        } else {
          audit = [
            {
              id: 'a_init',
              time: Date.now(),
              user: 'system',
              action: 'system_initialized',
              meta: { version: '2.0-react' }
            }
          ];
        }
        this.setItem(STORAGE_KEYS.AUDIT, audit);
      }

      // Also maintain backward-compatible ov:data mirror so external inspection doesn't break
      this.syncLegacyMirror();
    } catch (e) {
      console.error('[storageService] Initialization error:', e);
    }
  },

  syncLegacyMirror() {
    try {
      const data = {
        users: this.getUsers(),
        elections: this.getElections(),
        audit: this.getAuditLogs()
      };
      localStorage.setItem(STORAGE_KEYS.LEGACY_DATA, JSON.stringify(data));
    } catch {
      // Ignore if quota exceeded or private mode
    }
  },

  // Users
  getUsers() {
    const users = this.getItem(STORAGE_KEYS.USERS, null);
    if (!users || !Array.isArray(users)) {
      this.setItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return users;
  },

  saveUsers(users) {
    this.setItem(STORAGE_KEYS.USERS, users);
    this.syncLegacyMirror();
  },

  // Elections
  getElections() {
    const elections = this.getItem(STORAGE_KEYS.ELECTIONS, null);
    if (!elections || !Array.isArray(elections)) {
      this.setItem(STORAGE_KEYS.ELECTIONS, DEFAULT_ELECTIONS);
      return DEFAULT_ELECTIONS;
    }
    return elections;
  },

  saveElections(elections) {
    this.setItem(STORAGE_KEYS.ELECTIONS, elections);
    this.syncLegacyMirror();
  },

  // Audit Logs
  getAuditLogs() {
    const logs = this.getItem(STORAGE_KEYS.AUDIT, null);
    if (!logs || !Array.isArray(logs)) {
      return [];
    }
    return logs;
  },

  saveAuditLogs(logs) {
    // Preserve at most the latest 1,000 records
    const trimmed = logs.slice(0, 1000);
    this.setItem(STORAGE_KEYS.AUDIT, trimmed);
    this.syncLegacyMirror();
  },

  // Active User Session
  getCurrentUser() {
    return this.getItem(STORAGE_KEYS.USER, null);
  },

  setCurrentUser(user) {
    if (!user) {
      this.removeItem(STORAGE_KEYS.USER);
    } else {
      this.setItem(STORAGE_KEYS.USER, user);
    }
  },

  // Voting Status
  hasVoted(electionId, userId) {
    if (!electionId || !userId) return false;
    const key = `${STORAGE_KEYS.VOTED_PREFIX}${electionId}:${userId}`;
    return this.getItem(key, false) === true;
  },

  recordVote(electionId, userId) {
    if (!electionId || !userId) return;
    const key = `${STORAGE_KEYS.VOTED_PREFIX}${electionId}:${userId}`;
    this.setItem(key, true);
  },

  // Theme
  getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    } catch {
      return 'light';
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error(e);
    }
  },

  // Reset to Defaults
  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.ELECTIONS);
      localStorage.removeItem(STORAGE_KEYS.AUDIT);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_DATA);

      // Clean up all voting flags
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_KEYS.VOTED_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Re-initialize with clean defaults
      this.initStorage();
    } catch (e) {
      console.error('[storageService] Clear data error:', e);
    }
  }
};

// Self-initialize on module load
storageService.initStorage();
