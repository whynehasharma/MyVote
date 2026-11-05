import { storageService } from './storageService';
import { auditService } from './auditService';

export const votingService = {
  hasUserVoted(electionId, userId) {
    return storageService.hasVoted(electionId, userId);
  },

  castVote(electionId, candidateId, user) {
    if (!user || !user.id) {
      throw new Error('You must be signed in to vote.');
    }

    if (this.hasUserVoted(electionId, user.id)) {
      throw new Error('You have already voted in this election.');
    }

    const elections = storageService.getElections();
    const election = elections.find((e) => e.id === electionId);

    if (!election) {
      throw new Error('Election not found.');
    }

    if (!election.active) {
      throw new Error('This election is not currently active.');
    }

    if (election.ends && election.ends <= Date.now()) {
      throw new Error('This election has closed.');
    }

    const candidateExists = election.candidates.some((c) => c.id === candidateId);
    if (!candidateExists) {
      throw new Error('Selected candidate was not found in this election.');
    }

    // Update vote count
    const currentVotes = election.votes[candidateId] || 0;
    const updatedElection = {
      ...election,
      votes: {
        ...election.votes,
        [candidateId]: currentVotes + 1
      }
    };

    const updatedElections = elections.map((e) =>
      e.id === electionId ? updatedElection : e
    );

    // Save election and record voter flag
    storageService.saveElections(updatedElections);
    storageService.recordVote(electionId, user.id);

    // Audit log
    auditService.log(
      'vote',
      {
        election: electionId,
        electionTitle: election.title,
        candidate: candidateId,
        user: user.email
      },
      user
    );

    return updatedElection;
  }
};
