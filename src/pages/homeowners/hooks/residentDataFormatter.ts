
// Legacy file - functionality moved to services/resident-formatter-service.ts
// Re-export for backward compatibility
import { 
  DatabaseProperty, 
  DatabaseResident, 
  FormattedResident, 
  AssociationData 
} from './types/resident-types';
import { residentFormatterService } from './services/resident-formatter-service';

export const formatResidentsData = (
  residents: DatabaseResident[],
  properties: DatabaseProperty[],
  associations: AssociationData[]
): FormattedResident[] => {
  return residentFormatterService.formatResidentsData(residents, properties, associations);
};
