/**
 * Navigation Service for VoteBot
 * Validates routes against role-specific allowlists and resolves safe navigation targets.
 */

const ROLE_ALLOWLIST = {
  voter: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/vote', label: 'Active Elections / Voting' },
    { path: '/results', label: 'Results & Analytics' },
    { path: '/settings', label: 'My Profile & Settings' }
  ],
  admin: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/vote', label: 'Voting Booth' },
    { path: '/results', label: 'Results & Analytics' },
    { path: '/settings', label: 'Admin Settings' },
    { path: '/users', label: 'User Management' },
    { path: '/elections', label: 'Election Management' },
    { path: '/candidates', label: 'Candidate Setup' },
    { path: '/audit', label: 'Audit Logs' }
  ]
};

export const navigationService = {
  /**
   * Check if user with given role can access a path
   */
  canAccess(path, role = 'voter') {
    const list = ROLE_ALLOWLIST[role] || ROLE_ALLOWLIST.voter;
    return list.some((item) => item.path === path);
  },

  /**
   * Resolve an intent to a safe navigation target
   */
  resolveNavigation(intent, role = 'voter') {
    const intentRouteMap = {
      OPEN_DASHBOARD: { path: '/dashboard', label: 'Dashboard' },
      OPEN_VOTING: { path: '/vote', label: 'Active Elections / Voting' },
      OPEN_RESULTS: { path: '/results', label: 'Results & Analytics' },
      OPEN_PROFILE: { path: '/settings', label: 'My Profile' },
      OPEN_SETTINGS: { path: '/settings', label: 'Settings' },
      OPEN_USERS: { path: '/users', label: 'User Management', adminOnly: true },
      OPEN_ELECTIONS: { path: '/elections', label: 'Election Management', adminOnly: true },
      OPEN_AUDIT: { path: '/audit', label: 'Audit Logs', adminOnly: true }
    };

    const target = intentRouteMap[intent];
    if (!target) return null;

    if (target.adminOnly && role !== 'admin') {
      return {
        allowed: false,
        path: null,
        label: target.label,
        reason: 'This section requires Administrator privileges.'
      };
    }

    if (!this.canAccess(target.path, role)) {
      return {
        allowed: false,
        path: null,
        label: target.label,
        reason: 'You do not have permission to view this section.'
      };
    }

    return {
      allowed: true,
      path: target.path,
      label: target.label
    };
  }
};
