
import React, { useState } from 'react';
import { Download, FileSpreadsheet, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataExportService, dataImportService } from '@/services/import-export';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ExportDataTemplatesProps {
  associationId: string;
}

const ExportDataTemplates: React.FC<ExportDataTemplatesProps> = ({ associationId }) => {
  const [exportType, setExportType] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  
  const handleExport = async () => {
    if (!associationId) {
      toast.error('Please select an association first');
      return;
    }
    
    if (!exportType) {
      toast.error('Please select a data type to export');
      return;
    }
    
    setIsExporting(true);
    
    try {
      const result = await dataExportService.exportData({
        associationId,
        dataType: exportType,
        format: exportFormat,
      });
      
      if (result.success && result.data) {
        // Create and download the file
        const worksheet = XLSX.utils.json_to_sheet(result.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, exportType);
        
        if (exportFormat === 'csv') {
          const csvContent = XLSX.utils.sheet_to_csv(worksheet);
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = result.fileName;
          link.click();
        } else {
          XLSX.writeFile(workbook, result.fileName);
        }
        
        toast.success(`Data exported successfully as ${exportFormat.toUpperCase()}`);
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleGetTemplate = async (templateType: string) => {
    setIsGeneratingTemplate(true);
    
    try {
      // Get template data
      const template = dataImportService.getImportTemplate(templateType);
      
      // Convert template to file and download
      const worksheet = XLSX.utils.json_to_sheet([template]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, templateType);
      XLSX.writeFile(workbook, `${templateType}_template.xlsx`);
      
      toast.success(`${templateType} template downloaded successfully`);
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Options</CardTitle>
        <CardDescription>
          Export data from the system or download import templates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="export" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="templates">Download Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="exportType" className="text-sm font-medium">Data Type</label>
                <Select onValueChange={setExportType}>
                  <SelectTrigger id="exportType">
                    <SelectValue placeholder="Select data to export" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="associations">Associations</SelectItem>
                    <SelectItem value="properties_owners">Properties & Owners</SelectItem>
                    <SelectItem value="financial">Financial Data</SelectItem>
                    <SelectItem value="compliance">Compliance Issues</SelectItem>
                    <SelectItem value="maintenance">Maintenance Requests</SelectItem>
                    <SelectItem value="vendors">Vendors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="exportFormat" className="text-sm font-medium">Export Format</label>
                <Select 
                  defaultValue={exportFormat} 
                  onValueChange={(value) => setExportFormat(value as 'csv' | 'xlsx')}
                >
                  <SelectTrigger id="exportFormat">
                    <SelectValue placeholder="Select export format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleExport} 
                disabled={!exportType || !associationId || isExporting}
              >
                {isExporting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" /> 
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Download templates to prepare your data for import. Fill in the template and upload it using the Import tab.
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['associations', 'properties_owners', 'financial', 'compliance', 'maintenance', 'vendors'].map((type) => (
                <Card key={type} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base capitalize">
                      {type === 'properties_owners' ? 'Properties & Owners' : type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleGetTemplate(type)}
                      disabled={isGeneratingTemplate}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExportDataTemplates;
