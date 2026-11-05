import { storageService } from './storageService';
import { auditService } from './auditService';
import { uid } from '../utils/helpers';
import { validateElectionData } from '../utils/validation';

export const electionService = {
  getElections() {
    return storageService.getElections();
  },

  createElection({ title, ends = null }, user = null) {
    const validation = validateElectionData({ title });
    if (!validation.isValid) {
      throw new Error(validation.errors.title);
    }

    const newElection = {
      id: uid('el'),
      title: title.trim(),
      active: false,
      candidates: [],
      votes: {},
      ends: ends ? new Date(ends).getTime() : null,
      createdAt: Date.now()
    };

    const elections = storageService.getElections();
    const updated = [newElection, ...elections];
    storageService.saveElections(updated);

    auditService.log('create_election', { title: newElection.title, id: newElection.id }, user);
    return newElection;
  },

  toggleElection(electionId, user = null) {
    const elections = storageService.getElections();
    let updatedElection = null;

    const updated = elections.map((el) => {
      if (el.id === electionId) {
        // Prevent activating if already expired
        if (!el.active && el.ends && el.ends <= Date.now()) {
          throw new Error('Cannot activate an election whose closing time has already passed.');
        }
        updatedElection = { ...el, active: !el.active };
        return updatedElection;
      }
      return el;
    });

    if (!updatedElection) {
      throw new Error('Election not found.');
    }

    storageService.saveElections(updated);
    auditService.log(
      'toggle_election',
      { id: electionId, title: updatedElection.title, active: updatedElection.active },
      user
    );
    return updatedElection;
  },

  deleteElection(electionId, user = null) {
    const elections = storageService.getElections();
    const target = elections.find((e) => e.id === electionId);
    if (!target) return false;

    const filtered = elections.filter((e) => e.id !== electionId);
    storageService.saveElections(filtered);

    auditService.log('delete_election', { id: electionId, title: target.title }, user);
    return true;
  },

  addCandidate(electionId, candidateLabel, user = null) {
    if (!candidateLabel || !candidateLabel.trim()) {
      throw new Error('Candidate name cannot be empty.');
    }

    const elections = storageService.getElections();
    let addedCandidate = null;

    const updated = elections.map((el) => {
      if (el.id === electionId) {
        const candidate = {
          id: uid('c'),
          label: candidateLabel.trim()
        };
        addedCandidate = candidate;
        const candidates = [...el.candidates, candidate];
        const votes = { ...el.votes, [candidate.id]: 0 };
        return { ...el, candidates, votes };
      }
      return el;
    });

    if (!addedCandidate) {
      throw new Error('Election not found.');
    }

    storageService.saveElections(updated);
    auditService.log(
      'add_candidate',
      { electionId, candidateId: addedCandidate.id, label: addedCandidate.label },
      user
    );
    return addedCandidate;
  },

  removeCandidate(electionId, candidateId, user = null) {
    const elections = storageService.getElections();
    let removedLabel = '';

    const updated = elections.map((el) => {
      if (el.id === electionId) {
        const target = el.candidates.find((c) => c.id === candidateId);
        if (target) removedLabel = target.label;

        const candidates = el.candidates.filter((c) => c.id !== candidateId);
        const votes = { ...el.votes };
        delete votes[candidateId];
        return { ...el, candidates, votes };
      }
      return el;
    });

    storageService.saveElections(updated);
    auditService.log(
      'remove_candidate',
      { electionId, candidateId, label: removedLabel },
      user
    );
    return true;
  },

  reorderCandidate(electionId, candidateId, direction) {
    const elections = storageService.getElections();

    const updated = elections.map((el) => {
      if (el.id === electionId) {
        const idx = el.candidates.findIndex((c) => c.id === candidateId);
        if (idx === -1) return el;

        const candidates = [...el.candidates];
        if (direction === 'up' && idx > 0) {
          const temp = candidates[idx];
          candidates[idx] = candidates[idx - 1];
          candidates[idx - 1] = temp;
        } else if (direction === 'down' && idx < candidates.length - 1) {
          const temp = candidates[idx];
          candidates[idx] = candidates[idx + 1];
          candidates[idx + 1] = temp;
        }
        return { ...el, candidates };
      }
      return el;
    });

    storageService.saveElections(updated);
    return true;
  },

  checkAutoClosures() {
    const elections = storageService.getElections();
    let hasChanges = false;
    const now = Date.now();

    const updated = elections.map((el) => {
      if (el.active && el.ends && el.ends <= now) {
        hasChanges = true;
        auditService.log('election_auto_close', { id: el.id, title: el.title });
        return { ...el, active: false };
      }
      return el;
    });

    if (hasChanges) {
      storageService.saveElections(updated);
    }

    return updated;
  }
};
