// Legacy file - functionality moved to services/resident-formatter-service.ts
// Re-export for backward compatibility
import { residentFormatterService } from './services/resident-formatter-service';

export { residentFormatterService };

// Keep the original function signature for compatibility
export const formatResidentsData = (residents: any[], properties: any[], associations: any[]) => {
  return residentFormatterService.formatResidentsData(residents, properties, associations);
};
