
import { Homeowner } from '@/components/homeowners/detail/types';

export function formatCommentAsNote(comment: any) {
  return {
    id: comment.id,
    content: comment.content,
    author: comment.user_name,
    date: comment.created_at,
    type: comment.content.startsWith('[SYSTEM]') ? 'system' : 'manual'
  };
}

export function formatResidentAsHomeowner(resident: any): Homeowner {
  return {
    id: resident.id,
    name: resident.name,
    email: resident.email,
    phone: resident.phone,
    moveInDate: resident.move_in_date,
    property: resident.property?.address,
    unit: resident.property?.unit_number,
    status: 'active',
    type: resident.resident_type
  };
}
