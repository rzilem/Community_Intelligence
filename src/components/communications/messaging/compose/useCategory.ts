
import { useState } from 'react';
import { MessageCategory } from '@/types/communication-types';

const MESSAGE_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'events', label: 'Events' },
  { value: 'financial', label: 'Financial' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'community', label: 'Community News' }
];

export function useCategory(defaultCategory: MessageCategory = 'general') {
  const [category, setCategory] = useState<MessageCategory>(defaultCategory);
  return {
    category,
    setCategory,
    categories: MESSAGE_CATEGORIES
  };
}
