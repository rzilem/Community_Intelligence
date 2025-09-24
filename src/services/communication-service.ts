
// Use mock implementation for now
import { announcementService } from './communication-service-mock';

export * from './communication-service-mock';

export const communicationService = {
  getAllAssociations: () => Promise.resolve([]),
  getAssociationById: (id: string) => Promise.resolve(null),
  getRecipientGroups: (associationId: string) => Promise.resolve([]),
  getRecipientGroupsForAssociations: (associationIds: string[]) => Promise.resolve([]),
  getAssociationMembersByRole: (associationId: string, role: string) => Promise.resolve([]),
  getRecipientsInGroup: (groupId: string) => Promise.resolve([]),
  getAllResidents: (associationId: string) => Promise.resolve([]),
  getResidentsByType: (associationId: string, residentType: string) => Promise.resolve([]),
  getMembersByRoleType: (associationId: string, roleType: string) => Promise.resolve([]),
  getRecipientsByCustomCriteria: (associationId: string, criteria: Record<string, any>) => Promise.resolve([]),
  sendMessage: () => Promise.resolve({ success: true }),
  getAnnouncements: announcementService.getAnnouncements,
  createAnnouncement: announcementService.createAnnouncement,
  updateAnnouncement: announcementService.updateAnnouncement,
  deleteAnnouncement: announcementService.deleteAnnouncement
};
