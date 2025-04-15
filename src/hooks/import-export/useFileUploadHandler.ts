
import { useState } from 'react';
import { toast } from 'sonner';
import { useFileParser } from '@/components/data-import/useFileParser';

export function useFileUploadHandler({
  setImportFile,
  setImportData,
  setImportType,
  validateData,
  selectedAssociationId
}: {
  setImportFile: (file: File | null) => void;
  setImportData: (data: any[]) => void;
  setImportType: (type: string) => void;
  validateData: (data: any[], type: string) => Promise<any>;
  selectedAssociationId: string;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { parseFile } = useFileParser();
  
  const handleFileUpload = async (file: File, parsedData: any[], type: string) => {
    console.log('File upload handler called:', file.name, 'Type:', type, 'Rows:', parsedData?.length || 'parsing needed');
    
    // Always set the file regardless of association selection
    setImportFile(file);
    setImportType(type);
    
    // If no association is selected, just show a warning but don't proceed with validation
    if (!selectedAssociationId) {
      toast.warning('Please select an association before proceeding');
      return;
    }
    
    // If we have already parsed data, use it
    if (parsedData && parsedData.length > 0) {
      console.log('Using pre-parsed data, rows:', parsedData.length);
      setImportData(parsedData);
      
      try {
        console.log('Starting validation of pre-parsed data');
        await validateData(parsedData, type);
        console.log('Validation completed');
      } catch (error) {
        console.error('Error validating data:', error);
        toast.error('Failed to validate the uploaded data');
      }
      return;
    }
    
    // If we don't have parsed data but have a file, we need to parse it first
    if (file) {
      setIsProcessing(true);
      console.log('Starting file parsing, file size:', file.size, 'bytes');
      
      try {
        console.log('Parsing file:', file.name, 'Size:', file.size);
        const parsedResult = await parseFile(file);
        console.log('File parsed successfully, rows:', parsedResult.length);
        
        if (!parsedResult || parsedResult.length === 0) {
          toast.error('The file appears to be empty or could not be parsed');
          setIsProcessing(false);
          return;
        }
        
        setImportData(parsedResult);
        
        // Continue with validation
        await validateData(parsedResult, type);
      } catch (error) {
        console.error('Error parsing/validating file:', error);
        toast.error(`Failed to process the file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
      }
    } else {
      console.error('No file provided');
      toast.error('No data to import. Please upload a valid file.');
    }
  };

  return { handleFileUpload, isProcessing };
}
