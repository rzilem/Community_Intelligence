
// Use mock implementation for now
import { announcementService } from './communication-service-mock';

export * from './communication-service-mock';

export const communicationService = {
  getAllAssociations: () => Promise.resolve([]),
  getAssociationById: () => Promise.resolve(null),
  getRecipientGroups: () => Promise.resolve([]),
  getRecipientGroupsForAssociations: () => Promise.resolve([]),
  getAssociationMembersByRole: () => Promise.resolve([]),
  getRecipientsInGroup: () => Promise.resolve([]),
  getAllResidents: () => Promise.resolve([]),
  getResidentsByType: () => Promise.resolve([]),
  getMembersByRoleType: () => Promise.resolve([]),
  getRecipientsByCustomCriteria: () => Promise.resolve([]),
  sendMessage: () => Promise.resolve({ success: true }),
  getAnnouncements: announcementService.getAnnouncements,
  createAnnouncement: announcementService.createAnnouncement,
  updateAnnouncement: announcementService.updateAnnouncement,
  deleteAnnouncement: announcementService.deleteAnnouncement
};
