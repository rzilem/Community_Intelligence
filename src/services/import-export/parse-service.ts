
export const parseService = {
  parseCSV: (csvString: string): any[] => {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      
      return obj;
    });
  }
};
