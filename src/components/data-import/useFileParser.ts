
import { useState } from 'react';
import { parseService } from '@/services/import-export';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const useFileParser = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseFile = async (file: File): Promise<any[]> => {
    setIsProcessing(true);
    
    try {
      return await new Promise<any[]>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            if (!data) {
              reject(new Error('Failed to read file content'));
              return;
            }

            const fileName = file.name.toLowerCase();
            
            if (fileName.endsWith('.csv')) {
              // Parse CSV using the parseService
              if (typeof data === 'string') {
                const parsedData = parseService.parseCSV(data);
                resolve(parsedData);
              } else {
                reject(new Error('CSV data is not a string'));
              }
            } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
              // Parse Excel
              const workbook = XLSX.read(data, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const parsedData = XLSX.utils.sheet_to_json(worksheet);
              
              resolve(parsedData);
            } else {
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
