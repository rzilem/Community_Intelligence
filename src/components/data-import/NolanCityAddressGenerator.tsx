
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportAddressesAsCSV } from '@/data/nolan-city-addresses';
import { toast } from 'sonner';

const NolanCityAddressGenerator: React.FC = () => {
  const handleGenerateAddresses = () => {
    toast.info("Preparing 532 Nolan City addresses...");
    
    try {
      exportAddressesAsCSV();
      toast.success("Address data generated successfully!");
    } catch (error) {
      console.error("Error generating addresses:", error);
      toast.error("Failed to generate address data");
    }
  };
  
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-medium mb-2">Nolan City Address Generator</h3>
      <p className="text-muted-foreground mb-4">
        Generate 532 sample property addresses for Nolan City HOA in Austin, TX (78724).
        These addresses can be used for testing or populating your database.
      </p>
      <Button 
        onClick={handleGenerateAddresses}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Generate Nolan City Addresses
      </Button>
    </div>
  );
};

export default NolanCityAddressGenerator;
