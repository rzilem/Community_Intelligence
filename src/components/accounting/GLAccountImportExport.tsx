
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, Upload, FileText, AlertTriangle } from 'lucide-react';
import { GLAccount } from '@/types/accounting-types';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface GLAccountImportExportProps {
  accounts: GLAccount[];
  associationId?: string;
  onImportComplete: () => void;
}

const GLAccountImportExport: React.FC<GLAccountImportExportProps> = ({
  accounts,
  associationId,
  onImportComplete
}) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  
  const handleExport = () => {
    try {
      // Prepare the data for export
      const exportData = accounts.map(account => ({
        'Code': account.code,
        'Name': account.name,
        'Type': account.type,
        'Category': account.category || '',
        'Description': account.description || ''
      }));
      
      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'GL Accounts');
      
      // Generate the file and trigger download
      const fileName = associationId 
        ? `Association_GL_Accounts_${new Date().toISOString().slice(0, 10)}.xlsx`
        : `Master_GL_Accounts_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
      XLSX.writeFile(workbook, fileName);
      toast.success('GL Accounts exported successfully');
    } catch (error) {
      console.error('Error exporting GL accounts:', error);
      toast.error('Failed to export GL accounts');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    
    // Read the file and prepare preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Limit preview to first 5 rows
        setImportPreview(data.slice(0, 5));
      } catch (error) {
        console.error('Error reading Excel file:', error);
        toast.error('Failed to read Excel file. Please ensure it is a valid Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };
  
  const handleImport = () => {
    // In a real implementation, this would process the file and import the accounts
    toast.success('GL Accounts import feature is coming soon!');
    setIsImportDialogOpen(false);
    onImportComplete();
  };
  
  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-2" /> 
          Export
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsImportDialogOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" /> 
          Import
        </Button>
      </div>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import GL Accounts</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                Upload an Excel file (.xlsx) containing GL accounts
              </p>
              
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              
              <label htmlFor="file-upload">
                <Button variant="secondary" className="mt-2" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </span>
                </Button>
              </label>
              
              {importFile && (
                <p className="mt-2 text-sm font-medium">{importFile.name}</p>
              )}
            </div>
            
            {importPreview.length > 0 && (
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Preview (First 5 rows)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        {Object.keys(importPreview[0]).map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {importPreview.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value, j) => (
                            <td key={j} className="px-3 py-2 text-sm text-gray-500">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Only showing first 5 rows. Full import will process all rows.</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!importFile}
            >
              Import Accounts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GLAccountImportExport;
