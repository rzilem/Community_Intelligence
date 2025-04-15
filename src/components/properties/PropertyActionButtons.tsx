
import React, { useState } from 'react';
import { Download, PlusCircle } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PropertyDialog } from '@/components/properties/PropertyDialog';

const PropertyActionButtons: React.FC = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExport = () => {
    toast.success('Exporting properties as CSV...');
    
    // This would typically call a function to generate and download a CSV
    setTimeout(() => {
      // Mock download completed
      const mockData = "id,address,type,size,association,status\n1,123 Main St,single-family,1500,Oak Ridge HOA,occupied";
      const blob = new Blob([mockData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'properties.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Export completed successfully');
    }, 1500);
  };

  return (
    <>
      <div className="flex gap-2">
        <TooltipButton 
          tooltip="Export properties as CSV"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-2" /> Export
        </TooltipButton>
        <TooltipButton 
          variant="default" 
          tooltip="Add a new property"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Property
        </TooltipButton>
      </div>

      {isDialogOpen && (
        <PropertyDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          property={null}
        />
      )}
    </>
  );
};

export default PropertyActionButtons;
