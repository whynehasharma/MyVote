/**
 * Generate a unique ID with optional prefix
 */
export const uid = (prefix = 'id') => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + (prefix ? `_${prefix}` : '');
};

/**
 * Escape HTML special characters
 */
export const escapeHtml = (str) => {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

/**
 * Format a timestamp into a localized readable date/time string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate remaining time until a timestamp and format nicely
 */
export const formatCountdown = (targetTimestamp) => {
  if (!targetTimestamp) return null;
  const left = targetTimestamp - Date.now();
  if (left <= 0) return { expired: true, text: 'Closed' };

  const days = Math.floor(left / 86400000);
  const hrs = Math.floor((left % 86400000) / 3600000);
  const mins = Math.floor((left % 3600000) / 60000);
  const secs = Math.floor((left % 60000) / 1000);

  let text = '';
  if (days > 0) text += `${days}d `;
  text += `${hrs}h ${mins}m ${secs}s`;

  return { expired: false, text: `Ends in ${text}` };
};

/**
 * Debounce helper function
 */
export const debounce = (func, delay = 250) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

/**
 * Color palette for charts and candidate badges
 */
export const CHART_COLORS = [
  '#0f62fe', // IBM Carbon Blue
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ef4444', // Red
  '#7c3aed', // Purple
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#eab308'  // Yellow
];
