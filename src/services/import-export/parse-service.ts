
export const parseService = {
  parseCSV: (csvString: string): any[] => {
    console.log('Parsing CSV content, length:', csvString.length);
    
    try {
      const lines = csvString.trim().split('\n');
      console.log('CSV contains', lines.length, 'lines');
      
      if (lines.length === 0) {
        console.error('No data found in CSV');
        return [];
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      console.log('CSV headers:', headers);
      
      if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
        console.error('No headers found in CSV');
        return [];
      }
      
      const result = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const values = line.split(',').map(v => v.trim());
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
