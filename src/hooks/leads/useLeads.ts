
import { useLeadOperations } from './useLeadOperations';
import { useLeadMutations } from './useLeadMutations';

export const useLeads = () => {
  const operations = useLeadOperations();
  const mutations = useLeadMutations();
  
  return {
    ...operations,
    ...mutations
  };
};
