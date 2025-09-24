// Mock implementation for recipient service

export const recipientService = {
  getRecipientGroups: () => Promise.resolve([]),
  getRecipientGroupsForAssociations: () => Promise.resolve([]),
  getAssociationMembersByRole: () => Promise.resolve([]),
  getRecipientsInGroup: () => Promise.resolve([]),
  getAllResidents: () => Promise.resolve([]),
  getResidentsByType: () => Promise.resolve([]),
  getMembersByRoleType: () => Promise.resolve([]),
  getRecipientsByCustomCriteria: () => Promise.resolve([])
};