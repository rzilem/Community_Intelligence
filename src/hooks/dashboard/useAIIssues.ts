
import { useState } from 'react';

export interface AIIssue {
  id: string;
  title: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
}

export const useAIIssues = () => {
  const [issues] = useState<AIIssue[]>([
    {
      id: '1',
      title: 'Sample Issue',
      type: 'system',
      description: 'This is a sample AI-detected issue',
      severity: 'medium',
      status: 'open'
    }
  ]);
  const [loading] = useState(false);

  return {
    issues,
    loading
  };
};
