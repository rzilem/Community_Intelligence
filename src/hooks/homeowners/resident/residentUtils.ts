
import { Homeowner, NoteType } from '@/components/homeowners/detail/types';

/**
 * Converts the mock homeowner data to the Homeowner type
 */
export const convertDbResidentToHomeowner = (data: any): Homeowner => {
  // Ensure balance is a string
  const balanceStr = typeof data.balance === 'number' ? data.balance.toString() : data.balance || '0';

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    moveInDate: data.moveInDate,
    moveOutDate: data.moveOutDate,
    property: data.property || data.propertyAddress || '',
    unit: data.unit || data.unitNumber || '',
    balance: balanceStr,
    tags: data.tags || [],
    violations: typeof data.violations === 'number' ? data.violations : 0,
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
