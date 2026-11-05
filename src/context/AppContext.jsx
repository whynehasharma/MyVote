import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { auditService } from '../services/auditService';
import { electionService } from '../services/electionService';
import { votingService } from '../services/votingService';
import { authService } from '../services/authService';
import { exportDataToCSV, parseImportCSV } from '../utils/csvUtils';
import { uid } from '../utils/helpers';
import { validateUserData } from '../utils/validation';
import { hashPassword } from '../utils/crypto';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => storageService.getUsers());
  const [elections, setElections] = useState(() => storageService.getElections());
  const [auditLogs, setAuditLogs] = useState(() => storageService.getAuditLogs());
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  // Toast notification system
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = uid('toast');
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  // Confirmation dialog helper
  const showConfirmation = useCallback(({ title, message, onConfirm, confirmText = 'Confirm', danger = false }) => {
    setConfirmation({
      title,
      message,
      confirmText,
      danger,
      onConfirm: () => {
        onConfirm();
        setConfirmation(null);
      },
      onCancel: () => setConfirmation(null)
    });
  }, []);

  // Sync state helper
  const refreshData = useCallback(() => {
    setUsers(storageService.getUsers());
    const updatedElections = electionService.checkAutoClosures();
    setElections(updatedElections);
    setAuditLogs(storageService.getAuditLogs());
  }, []);

  // Timer loop for auto-closing expired elections
  useEffect(() => {
    const timer = setInterval(() => {
      const updated = electionService.checkAutoClosures();
      setElections((prev) => {
        const hasChange = prev.some((el) => {
          const fresh = updated.find((u) => u.id === el.id);
          return fresh && fresh.active !== el.active;
        });
        return hasChange ? [...updated] : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 5-second live refresh interval for voting synchronization
  useEffect(() => {
    const pollTimer = setInterval(() => {
      const freshElections = storageService.getElections();
      setElections(freshElections);
    }, 5000);

    return () => clearInterval(pollTimer);
  }, []);

  // User Actions (Admin)
  const addUser = async (userData, actorUser) => {
    const validation = validateUserData(userData, users);
    if (!validation.isValid) {
      const err = Object.values(validation.errors)[0];
      showToast(err, 'error');
      throw new Error(err);
    }

    const hashedPassword = await hashPassword(userData.password);

    const newUser = {
      id: uid('u'),
      name: userData.name.trim(),
      email: userData.email.trim(),
      role: userData.role || 'voter',
      password: hashedPassword,
      status: 'active',
      createdAt: Date.now()
    };

    const updatedUsers = [...users, newUser];
    storageService.saveUsers(updatedUsers);
    setUsers(updatedUsers);

    auditService.log('create_user', { email: newUser.email, role: newUser.role }, actorUser);
    setAuditLogs(storageService.getAuditLogs());
    showToast(`User ${newUser.name} created successfully!`, 'success');
    return newUser;
  };

  const editUser = (userId, updatedFields, actorUser) => {
    const validation = validateUserData(
      { name: updatedFields.name, email: updatedFields.email, role: updatedFields.role },
      users,
      userId
    );

    if (!validation.isValid) {
      const err = Object.values(validation.errors)[0];
      showToast(err, 'error');
      throw new Error(err);
    }

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          name: updatedFields.name.trim(),
          email: updatedFields.email.trim(),
          role: updatedFields.role
        };
      }
      return u;
    });

    storageService.saveUsers(updatedUsers);
    setUsers(updatedUsers);

    auditService.log('edit_user', { id: userId, email: updatedFields.email, role: updatedFields.role }, actorUser);
    setAuditLogs(storageService.getAuditLogs());
    showToast('User updated successfully', 'success');
  };

  const changeUserPassword = async (userId, newPassword, confirmPassword, actorUser) => {
    try {
      await authService.changePassword({
        userId,
        newPassword,
        confirmPassword,
        isAdminBypass: true,
        actorUser
      });
      setUsers(storageService.getUsers());
      setAuditLogs(storageService.getAuditLogs());
      showToast('User password successfully updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const deleteUser = (userId, actorUser) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const filtered = users.filter((u) => u.id !== userId);
    storageService.saveUsers(filtered);
    setUsers(filtered);

    auditService.log('delete_user', { id: userId, email: target.email }, actorUser);
    setAuditLogs(storageService.getAuditLogs());
    showToast(`User ${target.name} deleted`, 'info');
  };

  // Election Actions (Admin)
  const createElection = (data, actorUser) => {
    try {
      const newElection = electionService.createElection(data, actorUser);
      setElections(storageService.getElections());
      setAuditLogs(storageService.getAuditLogs());
      showToast(`Election "${newElection.title}" created!`, 'success');
      return newElection;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const toggleElection = (electionId, actorUser) => {
    try {
      const updated = electionService.toggleElection(electionId, actorUser);
      setElections(storageService.getElections());
      setAuditLogs(storageService.getAuditLogs());
      showToast(
        `Election is now ${updated.active ? 'Active' : 'Inactive'}`,
        updated.active ? 'success' : 'info'
      );
      return updated;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const deleteElection = (electionId, actorUser) => {
    electionService.deleteElection(electionId, actorUser);
    setElections(storageService.getElections());
    setAuditLogs(storageService.getAuditLogs());
    showToast('Election deleted', 'info');
  };

  const addCandidate = (electionId, candidateName, actorUser) => {
    try {
      const candidate = electionService.addCandidate(electionId, candidateName, actorUser);
      setElections(storageService.getElections());
      setAuditLogs(storageService.getAuditLogs());
      showToast(`Candidate "${candidate.label}" added!`, 'success');
      return candidate;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const removeCandidate = (electionId, candidateId, actorUser) => {
    electionService.removeCandidate(electionId, candidateId, actorUser);
    setElections(storageService.getElections());
    setAuditLogs(storageService.getAuditLogs());
    showToast('Candidate removed', 'info');
  };

  const reorderCandidate = (electionId, candidateId, direction) => {
    electionService.reorderCandidate(electionId, candidateId, direction);
    setElections(storageService.getElections());
  };

  // Voting Actions
  const castVote = (electionId, candidateId, voterUser) => {
    try {
      const updated = votingService.castVote(electionId, candidateId, voterUser);
      setElections(storageService.getElections());
      setAuditLogs(storageService.getAuditLogs());
      showToast('Your vote has been securely recorded!', 'success');
      return updated;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const hasVoted = (electionId, userId) => {
    return votingService.hasUserVoted(electionId, userId);
  };

  // Backup & Restore
  const exportAllData = () => {
    exportDataToCSV({ users, elections, auditLogs });
    showToast('Application data exported to CSV', 'success');
  };

  const importDataFromFile = async (file) => {
    try {
      const parsed = await parseImportCSV(file);
      if (parsed.users) {
        storageService.saveUsers(parsed.users);
        setUsers(parsed.users);
      }
      if (parsed.elections) {
        storageService.saveElections(parsed.elections);
        setElections(parsed.elections);
      }
      if (parsed.auditLogs) {
        storageService.saveAuditLogs(parsed.auditLogs);
        setAuditLogs(parsed.auditLogs);
      }
      showToast('Data imported and restored successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const clearAllData = () => {
    storageService.clearAllData();
    refreshData();
    showToast('All data has been reset to defaults', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        users,
        elections,
        auditLogs,
        toasts,
        confirmation,
        showToast,
        showConfirmation,
        refreshData,
        addUser,
        editUser,
        changeUserPassword,
        deleteUser,
        createElection,
        toggleElection,
        deleteElection,
        addCandidate,
        removeCandidate,
        reorderCandidate,
        castVote,
        hasVoted,
        exportAllData,
        importDataFromFile,
        clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
