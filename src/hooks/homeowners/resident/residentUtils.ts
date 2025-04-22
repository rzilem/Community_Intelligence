
import { NoteType } from '@/components/homeowners/detail/types';
import { Homeowner } from '@/components/homeowners/detail/types';
import { Resident } from '@/types/resident-types';

export const formatCommentAsNote = (comment: any): NoteType => {
  const isSystemNote = comment.content?.startsWith('[SYSTEM]');
  
  return {
    id: comment.id,
    content: isSystemNote ? comment.content.replace('[SYSTEM] ', '') : comment.content,
    author: comment.user_name || 'System',
    date: comment.created_at,
    type: isSystemNote ? 'system' : 'manual'
  };
};

export const formatResidentAsHomeowner = (resident: Resident): Homeowner => {
  return {
    id: resident.id,
    name: resident.name || '',
    email: resident.email || '',
    phone: resident.phone || '',
    property: resident?.property?.address || '',
    unit: resident?.property?.unit_number || '',
    moveInDate: resident.move_in_date || '',
    type: resident.resident_type,
    status: resident.move_out_date ? 'Inactive' : 'Active',
    balance: '0.00', // Default balance
    avatarUrl: '',
    notes: []
  };
};
