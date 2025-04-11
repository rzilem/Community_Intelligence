
import { 
  useAssociationsList, 
  useAssociationById
} from './useAssociationQueries';
import { useAssociationMutations } from './useAssociationMutations';

/**
 * Main hook that combines queries and mutations for associations
 */
export const useAssociations = () => {
  const { 
    associations, 
    isLoading, 
    error, 
    refetch, 
    manuallyRefresh,
    retryCount
  } = useAssociationsList();
  
  const {
    createAssociation,
    isCreating,
    updateAssociation,
    isUpdating,
    deleteAssociation,
    isDeleting
  } = useAssociationMutations(retryCount);
  
  return {
    associations,
    isLoading,
    error,
    refetch,
    manuallyRefresh,
    createAssociation,
    isCreating,
    updateAssociation,
    isUpdating,
    deleteAssociation,
    isDeleting,
    getAssociationById: useAssociationById
  };
};

export default useAssociations;
