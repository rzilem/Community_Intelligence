
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Settings } from 'lucide-react';
import { exportAddressesAsCSV } from '@/data/nolan-city-addresses';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';

const dataTypes = [
  { value: 'properties_owners', label: 'Properties & Owners' },
  { value: 'residents', label: 'Residents Only' },
  { value: 'maintenance', label: 'Maintenance Requests' },
  { value: 'compliance', label: 'Compliance Issues' },
  { value: 'financial', label: 'Financial Records' }
];

const propertyTypes = [
  { value: 'mixed', label: 'Mixed Property Types' },
  { value: 'single_family', label: 'Single Family Homes' },
  { value: 'townhome', label: 'Townhomes' },
  { value: 'condo', label: 'Condominiums' },
  { value: 'apartment', label: 'Apartments' }
];

const CustomDataGenerator: React.FC = () => {
  const [dataType, setDataType] = useState('properties_owners');
  const [associationName, setAssociationName] = useState('Nolan City');
  const [recordCount, setRecordCount] = useState(100);
  const [propertyType, setPropertyType] = useState('mixed');
  const [zipCode, setZipCode] = useState('78724');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateData = () => {
    setIsGenerating(true);
    toast.info(`Preparing ${recordCount} records for ${associationName}...`);
    
    try {
      // Currently only using the existing Nolan City generator
      // In the future, this would be enhanced to use all parameters
      exportAddressesAsCSV(recordCount, associationName, zipCode, city, state);
      
      toast.success(`${dataType} data generated successfully for ${associationName}!`);
    } catch (error) {
      console.error("Error generating data:", error);
      toast.error("Failed to generate data");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Data Generator</CardTitle>
        <CardDescription>
          Generate sample data for import based on your requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data-type">Data Type</Label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger id="data-type">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="association-name">Association Name</Label>
            <Input 
              id="association-name" 
              value={associationName} 
              onChange={(e) => setAssociationName(e.target.value)}
              placeholder="Enter association name"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="record-count">Number of Records: {recordCount}</Label>
            <span className="text-sm text-muted-foreground">{recordCount}</span>
          </div>
          <Slider
            id="record-count"
            min={10}
            max={1000}
            step={10}
            value={[recordCount]}
            onValueChange={(value) => setRecordCount(value[0])}
          />
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced-options">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Advanced Options</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="property-type">Property Type</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger id="property-type">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip-code">ZIP Code</Label>
                  <Input 
                    id="zip-code" 
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Button 
          onClick={handleGenerateData}
          className="w-full flex items-center gap-2"
          disabled={isGenerating}
        >
          <Download className="h-4 w-4" />
          {isGenerating ? 'Generating...' : `Generate ${dataType.replace('_', ' ')} Data`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomDataGenerator;
