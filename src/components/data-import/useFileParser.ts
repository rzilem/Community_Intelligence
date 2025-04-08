
import { useState } from 'react';
import { parseService } from '@/services/import-export';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const useFileParser = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseFile = async (file: File): Promise<any[]> => {
    setIsProcessing(true);
    console.log('Starting to parse file:', file.name, 'Size:', file.size);
    
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
            console.log('File parsed successfully, processing as:', fileName.endsWith('.csv') ? 'CSV' : 'Excel');
            
            if (fileName.endsWith('.csv')) {
              // Parse CSV using the parseService
              if (typeof data === 'string') {
                console.log('CSV data length:', data.length);
                console.log('CSV sample:', data.slice(0, 100) + '...');
                
                const parsedData = parseService.parseCSV(data);
                console.log('CSV parsing complete, rows:', parsedData.length);
                if (parsedData.length === 0) {
                  console.error('CSV parsing returned 0 rows');
                }
                resolve(parsedData);
              } else {
                console.error('CSV data is not a string:', typeof data);
                reject(new Error('CSV data is not a string'));
              }
            } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
              // Parse Excel
              try {
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const parsedData = XLSX.utils.sheet_to_json(worksheet);
                
                console.log('Excel parsing complete, rows:', parsedData.length);
                resolve(parsedData);
              } catch (excelError) {
                console.error('Excel parsing error:', excelError);
                reject(excelError);
              }
            } else {
              console.error('Unsupported file format:', fileName);
              reject(new Error('Unsupported file format'));
            }
          } catch (error) {
            console.error('Error parsing file:', error);
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(error);
        };
        
        if (file.name.endsWith('.csv')) {
          reader.readAsText(file);
        } else {
          reader.readAsBinaryString(file);
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
