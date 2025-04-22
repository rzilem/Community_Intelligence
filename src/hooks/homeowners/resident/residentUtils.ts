
import { NoteType } from '@/components/homeowners/detail/types';

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
