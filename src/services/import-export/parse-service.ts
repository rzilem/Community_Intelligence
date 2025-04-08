
export const parseService = {
  parseCSV: (csvString: string): any[] => {
    console.log('Parsing CSV content, length:', csvString.length);
    
    try {
      // Split by newline characters (handle different OS line endings)
      const lines = csvString.trim().split(/\r?\n/);
      console.log('CSV contains', lines.length, 'lines');
      
      if (lines.length === 0) {
        console.error('No data found in CSV');
        return [];
      }
      
      // Parse headers - handle quoted fields
      const headers = parseCSVLine(lines[0]);
      console.log('CSV headers:', headers);
      
      if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
        console.error('No headers found in CSV');
        return [];
      }
      
      const result = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const values = parseCSVLine(line);
        const obj: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          // Only add if header exists
          if (header) {
            obj[header] = index < values.length ? values[index] : '';
          }
        });
        
        result.push(obj);
      }
      
      console.log('Successfully parsed', result.length, 'rows of CSV data');
      return result;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// Helper function to properly parse CSV lines with quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Handle quotes - toggle inQuotes state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      // Add character to current field
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}
