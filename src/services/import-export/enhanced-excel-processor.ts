
import * as XLSX from 'xlsx';
import { devLog } from '@/utils/dev-logger';

export interface ExcelProcessingResult {
  success: boolean;
  data: any[];
  errors: string[];
  warnings: string[];
  metadata: {
    sheetNames: string[];
    processedSheet: string;
    originalRowCount: number;
    processedRowCount: number;
  };
}

export const enhancedExcelProcessor = {
  async processExcelFile(file: File): Promise<ExcelProcessingResult> {
    try {
      devLog.info('Processing Excel file:', file.name);
      
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer', cellStyles: true });
      
      const result: ExcelProcessingResult = {
        success: false,
        data: [],
        errors: [],
        warnings: [],
        metadata: {
          sheetNames: workbook.SheetNames,
          processedSheet: '',
          originalRowCount: 0,
          processedRowCount: 0
        }
      };

      // Try to find the best sheet to process
      const targetSheet = this.selectBestSheet(workbook);
      if (!targetSheet) {
        result.errors.push('No valid data sheet found in Excel file');
        return result;
      }

      result.metadata.processedSheet = targetSheet;
      const worksheet = workbook.Sheets[targetSheet];
      
      // Get raw data with multiple processing strategies
      const rawData = this.extractDataWithFallbacks(worksheet);
      result.metadata.originalRowCount = rawData.length;
      
      if (rawData.length === 0) {
        result.errors.push('No data rows found in Excel sheet');
        return result;
      }

      // Clean and normalize the data
      const cleanedData = this.cleanExcelData(rawData);
      result.metadata.processedRowCount = cleanedData.length;
      
      // Validate the cleaned data structure
      const validationResult = this.validateExcelStructure(cleanedData);
      result.data = validationResult.data;
      result.warnings = validationResult.warnings;
      result.errors = validationResult.errors;
      
      result.success = result.errors.length === 0 && result.data.length > 0;
      
      devLog.info('Excel processing completed:', result.metadata);
      return result;
      
    } catch (error) {
      devLog.error('Excel processing failed:', error);
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Unknown Excel processing error'],
        warnings: [],
        metadata: {
          sheetNames: [],
          processedSheet: '',
          originalRowCount: 0,
          processedRowCount: 0
        }
      };
    }
  },

  selectBestSheet(workbook: XLSX.WorkBook): string | null {
    if (workbook.SheetNames.length === 0) return null;
    
    // Prioritize sheets with data-like names
    const dataSheets = workbook.SheetNames.filter(name => {
      const lowerName = name.toLowerCase();
      return lowerName.includes('data') || 
             lowerName.includes('sheet1') || 
             lowerName.includes('properties') ||
             lowerName.includes('owners') ||
             lowerName.includes('residents');
    });
    
    if (dataSheets.length > 0) return dataSheets[0];
    
    // Find sheet with most data
    let bestSheet = workbook.SheetNames[0];
    let maxRows = 0;
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const rowCount = range.e.r - range.s.r + 1;
      
      if (rowCount > maxRows) {
        maxRows = rowCount;
        bestSheet = sheetName;
      }
    }
    
    return bestSheet;
  },

  extractDataWithFallbacks(worksheet: XLSX.WorkSheet): any[] {
    const strategies = [
      // Strategy 1: Standard JSON conversion
      () => XLSX.utils.sheet_to_json(worksheet, { defval: '' }),
      
      // Strategy 2: Skip empty rows and columns
      () => XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', 
        blankrows: false,
        raw: false 
      }),
      
      // Strategy 3: Raw data with header detection
      () => {
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        const data: any[] = [];
        
        // Find first non-empty row as header
        let headerRow = -1;
        for (let row = range.s.r; row <= range.e.r; row++) {
          const rowData: any = {};
          let hasData = false;
          
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = worksheet[cellAddr];
            if (cell && cell.v) {
              rowData[XLSX.utils.encode_col(col)] = cell.v;
              hasData = true;
            }
          }
          
          if (hasData && headerRow === -1) {
            headerRow = row;
            break;
          }
        }
        
        if (headerRow >= 0) {
          return XLSX.utils.sheet_to_json(worksheet, { 
            range: headerRow,
            defval: '',
            blankrows: false 
          });
        }
        
        return [];
      }
    ];

    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (result && Array.isArray(result) && result.length > 0) {
          devLog.info(`Excel extraction successful with strategy, got ${result.length} rows`);
          return result;
        }
      } catch (error) {
        devLog.warn('Excel extraction strategy failed:', error);
        continue;
      }
    }

    return [];
  },

  cleanExcelData(rawData: any[]): any[] {
    return rawData
      .filter(row => {
        // Remove completely empty rows
        const values = Object.values(row);
        return values.some(val => 
          val !== null && 
          val !== undefined && 
          String(val).trim() !== ''
        );
      })
      .map(row => {
        const cleanedRow: any = {};
        
        Object.entries(row).forEach(([key, value]) => {
          // Clean column names
          let cleanKey = key;
          if (key.includes('__EMPTY')) {
            // Skip empty columns from Excel
            return;
          }
          
          // Normalize common column name variations
          cleanKey = this.normalizeColumnName(key);
          
          // Clean values
          let cleanValue = value;
          if (typeof value === 'string') {
            cleanValue = value.trim();
          }
          
          if (cleanValue !== null && cleanValue !== undefined && cleanValue !== '') {
            cleanedRow[cleanKey] = cleanValue;
          }
        });
        
        return cleanedRow;
      })
      .filter(row => Object.keys(row).length > 0);
  },

  normalizeColumnName(columnName: string): string {
    const normalized = columnName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    // Map common variations to standard names
    const mappings: Record<string, string> = {
      'addr': 'address',
      'street': 'address',
      'property_addr': 'address',
      'fname': 'first_name',
      'lname': 'last_name',
      'firstname': 'first_name',
      'lastname': 'last_name',
      'owner': 'owner_name',
      'email_address': 'email',
      'phone_number': 'phone',
      'unit_no': 'unit_number',
      'apt': 'unit_number'
    };
    
    return mappings[normalized] || normalized;
  },

  validateExcelStructure(data: any[]): { data: any[]; warnings: string[]; errors: string[] } {
    const result = {
      data: [...data],
      warnings: [] as string[],
      errors: [] as string[]
    };

    if (data.length === 0) {
      result.errors.push('No valid data rows found after cleaning');
      return result;
    }

    // Check data consistency
    const firstRowKeys = Object.keys(data[0]);
    if (firstRowKeys.length === 0) {
      result.errors.push('First row contains no valid columns');
      return result;
    }

    // Check for consistent column structure
    const inconsistentRows = data.filter((row, index) => {
      const rowKeys = Object.keys(row);
      return rowKeys.length === 0 || 
             (rowKeys.length < firstRowKeys.length * 0.5); // Less than 50% of expected columns
    });

    if (inconsistentRows.length > data.length * 0.2) {
      result.warnings.push(`${inconsistentRows.length} rows have inconsistent structure`);
    }

    // Check for potential data quality issues
    const emptyValueCounts = firstRowKeys.reduce((acc, key) => {
      acc[key] = data.filter(row => !row[key] || String(row[key]).trim() === '').length;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(emptyValueCounts).forEach(([column, emptyCount]) => {
      if (emptyCount > data.length * 0.8) {
        result.warnings.push(`Column '${column}' is mostly empty (${emptyCount}/${data.length} rows)`);
      }
    });

    devLog.info('Excel structure validation completed:', {
      totalRows: data.length,
      columns: firstRowKeys,
      warnings: result.warnings.length,
      errors: result.errors.length
    });

    return result;
  }
};
