
import { toast } from 'sonner';

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
  const handleFileUpload = async (file: File, parsedData: any[], type: string) => {
    console.log('File uploaded:', file.name, 'Type:', type, 'Rows:', parsedData?.length || 'parsing needed');
    setImportFile(file);
    
    // Only proceed with validation if we have an association selected
    if (!selectedAssociationId) {
      toast.warning('Please select an association before proceeding');
      return;
    }
    
    // If we don't have parsed data but have a file, we need to parse it first
    if ((!parsedData || parsedData.length === 0) && file) {
      console.log('Starting file parsing...');
      
      try {
        const { useFileParser } = await import('@/components/data-import/useFileParser');
        const { parseFile } = useFileParser();
        
        console.log('Parsing file:', file.name, 'Size:', file.size);
        const parsedResult = await parseFile(file);
        console.log('File parsed successfully, rows:', parsedResult.length);
        
        if (parsedResult.length === 0) {
          toast.error('The file appears to be empty or could not be parsed');
          return;
        }
        
        setImportData(parsedResult);
        setImportType(type);
        
        // Continue with validation
        await validateData(parsedResult, type);
      } catch (error) {
        console.error('Error parsing/validating file:', error);
        toast.error(`Failed to process the file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } 
    // If we already have parsed data, proceed with validation
    else if (parsedData && parsedData.length > 0) {
      setImportData(parsedData);
      setImportType(type);
      
      try {
        await validateData(parsedData, type);
      } catch (error) {
        console.error('Error validating data:', error);
        toast.error('Failed to validate the uploaded data');
      }
    }
  };

  return { handleFileUpload };
}
