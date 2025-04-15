
import React, { useState } from 'react';
import { Download, PlusCircle } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PropertyDialog } from '@/components/properties/PropertyDialog';
import { supabase } from '@/integrations/supabase/client';

const PropertyActionButtons: React.FC = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    toast.info('Exporting properties as CSV...');
    
    try {
      // Try to get properties from Supabase if available
      let propertiesData;
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*');
          
        if (error) throw error;
        propertiesData = data;
      } catch (dbError) {
        console.warn('Falling back to mock data:', dbError);
        // Fallback to mock data if Supabase query fails
        propertiesData = [
          { id: '1', address: '123 Main St', property_type: 'single-family', square_feet: 1500, association_name: 'Oak Ridge HOA', status: 'occupied' },
          { id: '2', address: '456 Elm St', property_type: 'condo', square_feet: 1200, association_name: 'Maple Grove HOA', status: 'vacant' },
          { id: '3', address: '789 Oak Dr', property_type: 'townhouse', square_feet: 1800, association_name: 'Pine Valley HOA', status: 'occupied' }
        ];
      }

      // Convert to CSV
      const headers = Object.keys(propertiesData[0] || {}).join(',');
      const rows = propertiesData.map(property => 
        Object.values(property).map(val => 
          typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'properties.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <TooltipButton 
          tooltip="Export properties as CSV"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" /> 
          {isExporting ? 'Exporting...' : 'Export'}
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
