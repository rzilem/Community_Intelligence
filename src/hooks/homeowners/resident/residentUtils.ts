
import { Homeowner, NoteType } from '@/components/homeowners/detail/types';

/**
 * Converts the mock homeowner data to the Homeowner type
 */
export const convertDbResidentToHomeowner = (data: any): Homeowner => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    moveInDate: data.moveInDate,
    property: data.property || data.propertyAddress || '',
    unit: data.unit || data.unitNumber || '',
    balance: data.balance || 0,
    tags: data.tags || [],
    violations: data.violations || [],
    lastContact: {
      called: data.lastContact?.called || '',
      visit: data.lastContact?.visit || '',
      email: data.lastContact?.email || ''
    },
    status: data.status,
    avatarUrl: data.avatarUrl || '',
    notes: (data.notes || []).map((note: any) => ({
      type: (note.type === 'system' ? 'system' : 'manual') as NoteType['type'],
      author: note.author || '',
      content: note.content || '',
      date: note.date || ''
    })),
    // Add additional fields for compatibility
    type: data.type,
    propertyId: data.propertyId,
    propertyAddress: data.propertyAddress,
    association: data.association,
    moveOutDate: data.moveOutDate,
    lastPayment: data.lastPayment,
    aclStartDate: data.aclStartDate,
    closingDate: data.closingDate
  };
};

/**
 * Formats a comment from the database into a Note type
 */
export const formatCommentAsNote = (comment: any): NoteType => {
  return {
    type: comment.content.includes('[SYSTEM]') ? 'system' : 'manual',
    author: comment.content.includes('[SYSTEM]') ? 'System' : comment.user_name || 'Staff',
    content: comment.content.replace('[SYSTEM]', '').trim(),
    date: new Date(comment.created_at).toLocaleString()
  };
};
