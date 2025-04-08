
// This file is maintained for backward compatibility
// It re-exports all functionality from the new modular services
import { dataImportService, dataExportService } from './import-export';
import { ImportOptions, ExportOptions } from './import-export/types';
import { parseService } from './import-export/parse-service';

// Re-export for backward compatibility
export { dataImportService, dataExportService };
export type { ImportOptions, ExportOptions };

// Re-export the parseCSV function at the top level for backward compatibility
export const parseCSV = parseService.parseCSV;
