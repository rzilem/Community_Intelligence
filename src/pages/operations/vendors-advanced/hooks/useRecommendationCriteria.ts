
import { useState } from 'react';
import { DEFAULT_RECOMMENDATION_CRITERIA } from '../config/recommendation-defaults';

export const useRecommendationCriteria = () => {
  const [criteria, setCriteria] = useState(DEFAULT_RECOMMENDATION_CRITERIA);

  const updateCriteria = (updates: Partial<typeof criteria>) => {
    setCriteria(prev => ({ ...prev, ...updates }));
  };

  return {
    criteria,
    updateCriteria
  };
};
