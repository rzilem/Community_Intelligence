import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, FileText, File, Table } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toCSV } from '@/utils/csv';

interface ExportUtilitiesProps {
  data: any;
  filename: string;
  reportType: string;
}

const ExportUtilities: React.FC<ExportUtilitiesProps> = ({ data, filename, reportType }) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    try {
      const header = `${reportType}\nGenerated: ${new Date().toLocaleString()}\n\n`;
      let csvContent = '';

      if (Array.isArray(data)) {
        csvContent = toCSV(data);
      } else if (data && typeof data === 'object') {
        // Fallback for object data structures (keyed sections)
        const sections: string[] = [];
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            const sectionCsv = toCSV(value as any[]);
            sections.push(`${key}\n${sectionCsv}`);
          } else {
            sections.push(`${key},${value}`);
          }
        });
        csvContent = sections.join('\n\n');
      }

      const finalCsv = header + (csvContent || '');
      const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: 'Export Successful',
        description: 'CSV file has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export CSV file',
        variant: 'destructive',
      });
    }
  };

  const exportToExcel = () => {
    try {
      // For now, we'll create a more structured CSV that can be opened in Excel
      // In a real implementation, you'd use a library like xlsx
      let xlsContent = `${reportType}\t\t\t\n`;
      xlsContent += `Generated: ${new Date().toLocaleString()}\t\t\t\n\n`;
      
      if (Array.isArray(data)) {
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          xlsContent += headers.join('\t') + '\n';
          
          data.forEach(row => {
            const values = headers.map(header => row[header] || '');
            xlsContent += values.join('\t') + '\n';
          });
        }
      }

      const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.xls`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: "Export Successful",
        description: "Excel file has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export Excel file",
        variant: "destructive"
      });
    }
  };

  const exportToPDF = () => {
    try {
      // Create a formatted HTML content for PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${reportType}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .header-info { margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${reportType}</h1>
          <div class="header-info">
            Generated: ${new Date().toLocaleString()}<br>
            Report Date: ${new Date().toLocaleDateString()}
          </div>
      `;

      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        htmlContent += '<table><thead><tr>';
        headers.forEach(header => {
          htmlContent += `<th>${header}</th>`;
        });
        htmlContent += '</tr></thead><tbody>';
        
        data.forEach(row => {
          htmlContent += '<tr>';
          headers.forEach(header => {
            const value = row[header];
            htmlContent += `<td>${value !== null && value !== undefined ? value : ''}</td>`;
          });
          htmlContent += '</tr>';
        });
        htmlContent += '</tbody></table>';
      }

      htmlContent += '</body></html>';

      // Open in new window for printing to PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      toast({
        title: "PDF Export",
        description: "Print dialog opened. Choose 'Save as PDF' as destination"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF file",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToCSV} className="gap-2">
          <Table className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} className="gap-2">
          <File className="h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportUtilities;