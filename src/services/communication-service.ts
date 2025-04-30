
import { associationService } from './communications/association-service';
import { recipientService } from './communications/recipient-service';
import { messageService } from './communications/message-service';
import { announcementService } from './communications/announcement-service';

// Export a combined service for backward compatibility
export const communicationService = {
  // Association methods
  getAllAssociations: associationService.getAllAssociations,
  getAssociationById: associationService.getAssociationById,
  
  // Recipient group methods
  getRecipientGroups: recipientService.getRecipientGroups,
  getRecipientGroupsForAssociations: recipientService.getRecipientGroupsForAssociations,
  getAssociationMembersByRole: recipientService.getAssociationMembersByRole,
  getRecipientsInGroup: recipientService.getRecipientsInGroup,
  
  // Recipient helper methods
  getAllResidents: recipientService.getAllResidents,
  getResidentsByType: recipientService.getResidentsByType,
  getMembersByRoleType: recipientService.getMembersByRoleType,
  getRecipientsByCustomCriteria: recipientService.getRecipientsByCustomCriteria,
  
  // Message methods
  sendMessage: messageService.sendMessage,
  
  // Announcement methods
  getAnnouncements: announcementService.getAnnouncements,
  createAnnouncement: announcementService.createAnnouncement,
  updateAnnouncement: announcementService.updateAnnouncement,
  deleteAnnouncement: announcementService.deleteAnnouncement
};
