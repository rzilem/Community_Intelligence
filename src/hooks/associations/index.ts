
export * from './useAssociations';
export * from './useAssociationMutations';

// Add an alias for compatibility
import { useAssociations } from './useAssociations';
export const useAssociationsList = useAssociations;
