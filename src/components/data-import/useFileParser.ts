
import { useState } from 'react';
import { parseService } from '@/services/import-export';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const useFileParser = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseFile = async (file: File): Promise<any[]> => {
    setIsProcessing(true);
    console.log('Starting to parse file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    try {
      return await new Promise<any[]>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            if (!data) {
              console.error('Failed to read file content');
              reject(new Error('Failed to read file content'));
              return;
            }

            const fileName = file.name.toLowerCase();
            console.log('File read successfully, processing as:', 
              fileName.endsWith('.csv') ? 'CSV' : 'Excel');
            
            if (fileName.endsWith('.csv')) {
              // Parse CSV using the parseService
              if (typeof data === 'string') {
                console.log('CSV data loaded, length:', data.length);
                console.log('CSV first 100 chars:', data.slice(0, 100).replace(/\n/g, '\\n') + '...');
                
                const parsedData = parseService.parseCSV(data);
                console.log('CSV parsing complete, rows:', parsedData.length);
                if (parsedData.length === 0) {
                  console.error('CSV parsing returned 0 rows');
                  reject(new Error('No data could be parsed from the CSV file. Please check the file format.'));
                } else {
                  console.log('First row sample:', JSON.stringify(parsedData[0]));
                  resolve(parsedData);
                }
              } else {
                console.error('CSV data is not a string:', typeof data);
                reject(new Error('CSV data is not in the expected format'));
              }
            } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
              // Parse Excel
              try {
                const workbook = XLSX.read(data, { type: data instanceof ArrayBuffer ? 'array' : 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const parsedData = XLSX.utils.sheet_to_json(worksheet);
                
                console.log('Excel parsing complete, rows:', parsedData.length);
                if (parsedData.length === 0) {
                  console.error('Excel parsing returned 0 rows');
                  reject(new Error('No data could be parsed from the Excel file. Please check the file.'));
                } else {
                  console.log('First row sample:', JSON.stringify(parsedData[0]));
                  resolve(parsedData);
                }
              } catch (excelError) {
                console.error('Excel parsing error:', excelError);
                reject(new Error(`Failed to parse Excel file: ${excelError instanceof Error ? excelError.message : 'Unknown error'}`));
              }
            } else {
              console.error('Unsupported file format:', fileName);
              reject(new Error(`Unsupported file format: ${fileName}. Please use CSV or Excel files.`));
            }
          } catch (error) {
            console.error('Error parsing file:', error);
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(new Error('Error reading file. Please try again.'));
        };
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          reader.readAsText(file);
        } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
          reader.readAsArrayBuffer(file);
        } else {
          reject(new Error('Unsupported file format. Please use CSV or Excel files.'));
        }
      });
    } catch (error) {
      console.error('Error in parseFile:', error);
      toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { parseFile, isProcessing };
};
