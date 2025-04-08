
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ImportDataFormProps {
  onFileUpload: (file: File, parsedData: any[], type: string) => void;
  associationId: string;
}

const ImportDataForm: React.FC<ImportDataFormProps> = ({ onFileUpload, associationId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('associations');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const fileName = file.name.toLowerCase();
          
          if (fileName.endsWith('.csv')) {
            // Parse CSV
            const text = data as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            const parsedData = lines.slice(1)
              .filter(line => line.trim().length > 0) // Skip empty lines
              .map(line => {
                const values = line.split(',').map(v => v.trim());
                const row: Record<string, any> = {};
                
                headers.forEach((header, index) => {
                  if (index < values.length) {
                    row[header] = values[index];
                  }
                });
                
                return row;
              });
            
            resolve(parsedData);
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
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && importType && associationId) {
      setIsProcessing(true);
      
      try {
        // Parse the file to get the data
        const parsedData = await parseFile(selectedFile);
        
        if (parsedData.length === 0) {
          toast.error('The file appears to be empty or could not be parsed');
          setIsProcessing(false);
          return;
        }
        
        // Pass the file, parsed data, and type to the parent component
        onFileUpload(selectedFile, parsedData, importType);
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>
            Upload CSV or Excel files to import data into the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Data Type to Import</h3>
            <RadioGroup
              defaultValue={importType}
              onValueChange={setImportType}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="associations" id="associations" />
                <Label htmlFor="associations" className="flex-1 cursor-pointer">Associations</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="owners" id="owners" />
                <Label htmlFor="owners" className="flex-1 cursor-pointer">Owners/Residents</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="properties" id="properties" />
                <Label htmlFor="properties" className="flex-1 cursor-pointer">Properties</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="financial" id="financial" />
                <Label htmlFor="financial" className="flex-1 cursor-pointer">
                  Financial Data
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-2 text-muted-foreground inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Import financial data including assessments, payments, and transactions
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="compliance" id="compliance" />
                <Label htmlFor="compliance" className="flex-1 cursor-pointer">Compliance Issues</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="maintenance" id="maintenance" />
                <Label htmlFor="maintenance" className="flex-1 cursor-pointer">Maintenance Requests</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                <RadioGroupItem value="vendors" id="vendors" />
                <Label htmlFor="vendors" className="flex-1 cursor-pointer">
                  Vendors
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-2 text-muted-foreground inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Import vendor data including contact information and service categories
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Upload File</h3>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Drag and drop or click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports CSV and Excel (.xlsx) files
                  </p>
                </div>
                <label className="cursor-pointer">
                  <Button variant="outline" type="button">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between border rounded-md p-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!selectedFile || !importType || !associationId || isProcessing}
            >
              {isProcessing ? 'Processing...' : !associationId ? 'Select an Association' : 'Upload and Validate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ImportDataForm;
