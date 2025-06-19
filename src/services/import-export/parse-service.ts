
import * as XLSX from 'xlsx';

export const parseService = {
  parseCSV: (csvString: string): any[] => {
    console.log('Parsing CSV content, length:', csvString.length);
    
    try {
      // Split by newline characters while respecting quoted values
      const lines = parseCSVLines(csvString);
      console.log('CSV contains', lines.length, 'lines');
      
      if (lines.length === 0) {
        console.error('No data found in CSV');
        return [];
      }
      
      // Parse headers - handle quoted fields
      const headers = parseCSVRow(lines[0]);
      console.log('CSV headers:', headers);
      
      if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
        console.error('No headers found in CSV');
        return [];
      }
      
      const result = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const values = parseCSVRow(line);
        
        // Skip if we parsed an empty row
        if (values.length === 0 || (values.length === 1 && values[0] === '')) {
          continue;
        }
        
        const obj: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          // Only add if header exists
          if (header) {
            obj[header] = index < values.length ? values[index] : '';
          }
        });
        
        // Only add rows that have at least one non-empty value
        if (Object.values(obj).some(val => val !== '')) {
          result.push(obj);
        }
      }
      
      console.log('Successfully parsed', result.length, 'rows of CSV data');
      
      // Log a sample of parsed data for debugging
      if (result.length > 0) {
        console.log('Sample row:', JSON.stringify(result[0]));
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  parseExcel: (arrayBuffer: ArrayBuffer): { data: any[]; headers: string[] } => {
    try {
      console.log('Parsing Excel file, buffer size:', arrayBuffer.byteLength);
      
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        throw new Error('No sheets found in Excel file');
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        return { data: [], headers: [] };
      }
      
      // First row contains headers
      const headers = (jsonData[0] as any[]).map(h => String(h || '').trim()).filter(h => h);
      
      // Convert remaining rows to objects
      const data = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length === 0) continue;
        
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          if (header) {
            obj[header] = index < row.length ? (row[index] || '') : '';
          }
        });
        
        // Only add rows that have at least one non-empty value
        if (Object.values(obj).some(val => val !== '')) {
          data.push(obj);
        }
      }
      
      console.log('Successfully parsed Excel:', data.length, 'rows with headers:', headers);
      
      return { data, headers };
    } catch (error) {
      console.error('Error parsing Excel:', error);
      throw new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  parseFileContent: async (content: string, filename: string): Promise<{ data: any[]; headers: string[] }> => {
    console.log('Parsing file content for:', filename);
    
    try {
      const fileExtension = filename.toLowerCase().split('.').pop();
      
      switch (fileExtension) {
        case 'csv':
        case 'txt':
          const csvData = parseService.parseCSV(content);
          const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];
          return { data: csvData, headers };
          
        case 'xlsx':
        case 'xls':
          // For now, treat Excel files as CSV (will be enhanced in future)
          // This is a temporary fallback until we implement proper Excel parsing
          console.warn('Excel file detected, attempting to parse as CSV');
          const excelData = parseService.parseCSV(content);
          const excelHeaders = excelData.length > 0 ? Object.keys(excelData[0]) : [];
          return { data: excelData, headers: excelHeaders };
          
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      console.error('Error parsing file content:', error);
      throw new Error(`Failed to parse ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// Split CSV into lines, respecting quoted fields that may contain newlines
function parseCSVLines(csvString: string): string[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    const nextChar = i < csvString.length - 1 ? csvString[i + 1] : '';
    
    // Handle quotes
    if (char === '"') {
      // Check for escaped quotes (double quotes)
      if (nextChar === '"') {
        currentLine += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        currentLine += char;
      }
    }
    // Handle newlines
    else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      // End of line outside quotes
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip the \n in \r\n
      }
      
      lines.push(currentLine);
      currentLine = '';
    }
    // Handle all other characters
    else {
      currentLine += char;
    }
  }
  
  // Add the last line if not empty
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Parse a CSV row into fields, respecting quoted values
function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = i < line.length - 1 ? line[i + 1] : '';
    
    // Handle quotes
    if (char === '"') {
      // Check for escaped quotes (double quotes)
      if (nextChar === '"') {
        currentField += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    }
    // Handle field separators
    else if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    }
    // Handle all other characters
    else {
      currentField += char;
    }
  }
  
  // Add the last field
  fields.push(currentField);
  
  // Clean fields - trim whitespace and remove surrounding quotes
  return fields.map(field => {
    let trimmed = field.trim();
    
    // Remove surrounding quotes if present
    if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
      trimmed = trimmed.substring(1, trimmed.length - 1);
    }
    
    return trimmed;
  });
}
