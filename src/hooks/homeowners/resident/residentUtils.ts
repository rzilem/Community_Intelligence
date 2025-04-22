
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
  // Map resident_type to the compatible Homeowner type format
  let residentType: 'owner' | 'tenant' | 'family-member' | 'other' = 'other';
  
  if (resident.resident_type === 'owner') {
    residentType = 'owner';
  } else if (resident.resident_type === 'tenant') {
    residentType = 'tenant';
  } else if (resident.resident_type === 'family') {
    residentType = 'family-member';
  }
  
  return {
    id: resident.id,
    name: resident.name || '',
    email: resident.email || '',
    phone: resident.phone || '',
    // Safely access nested property with optional chaining
    property: resident.property_id ? resident.property?.address || '' : '',
    unit: resident.property_id ? resident.property?.unit_number || '' : '',
    moveInDate: resident.move_in_date || '',
    type: residentType,
    status: resident.move_out_date ? 'Inactive' : 'Active',
    balance: '0.00', // Default balance
    avatarUrl: '',
    notes: []
  };
};
