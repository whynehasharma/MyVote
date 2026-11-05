import { storageService } from './storageService';
import { uid } from '../utils/helpers';

/**
 * Service for managing audit logs
 */
export const auditService = {
  log(action, meta = {}, currentUser = null) {
    try {
      const activeUser = currentUser || storageService.getCurrentUser();
      const userIdentifier = activeUser ? activeUser.email : 'system';

      const entry = {
        id: uid('a'),
        time: Date.now(),
        user: userIdentifier,
        action,
        meta
      };

      const existingLogs = storageService.getAuditLogs();
      const updatedLogs = [entry, ...existingLogs];

      storageService.saveAuditLogs(updatedLogs);
      return entry;
    } catch (e) {
      console.error('[auditService] Error writing audit log:', e);
      return null;
    }
  },

  getAll() {
    return storageService.getAuditLogs();
  }
};
