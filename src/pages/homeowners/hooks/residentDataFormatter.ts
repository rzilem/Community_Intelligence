// Legacy file - functionality moved to services/resident-formatter-service.ts
// Re-export for backward compatibility
export { residentFormatterService } from './services/resident-formatter-service';

// Keep the original function signature for compatibility
export const formatResidentsData = residentFormatterService.formatResidentsData.bind(residentFormatterService);
