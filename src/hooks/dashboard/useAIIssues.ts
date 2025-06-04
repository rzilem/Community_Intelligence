
import { useState } from 'react';

export interface AIIssue {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
}

export const useAIIssues = () => {
  const [issues] = useState<AIIssue[]>([]);
  const [loading] = useState(false);

  return {
    issues,
    loading
  };
};
