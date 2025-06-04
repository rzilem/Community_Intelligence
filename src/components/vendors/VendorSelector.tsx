
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';
import { vendorService } from '@/services/vendor-service';

interface VendorSelectorProps {
  onVendorChange: (vendorName: string) => void;
  initialVendorName?: string;
  className?: string;
  label?: React.ReactNode | false;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  onVendorChange,
  initialVendorName,
  className,
  label = "Select Vendor"
}) => {
  const [open, setOpen] = useState(false);
  const [selectedVendorName, setSelectedVendorName] = useState<string | undefined>(initialVendorName);
  const [vendors, setVendors] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        const vendorData = await vendorService.getVendors();
        setVendors(vendorData.map(vendor => ({
          id: vendor.id,
          name: vendor.name
        })));
      } catch (error) {
        console.error('Error loading vendors:', error);
        toast.error('Failed to load vendors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    setSelectedVendorName(initialVendorName);
  }, [initialVendorName]);

  const handleSelect = (vendorName: string) => {
    setSelectedVendorName(vendorName);
    onVendorChange(vendorName);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedVendorName(undefined);
    onVendorChange('');
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label !== false && <h3 className="font-medium mb-1">{label}</h3>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between" // Ensure full width
            disabled={isLoading}
          >
            {isLoading 
              ? "Loading vendors..." 
              : selectedVendorName || "Select a vendor"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full" align="start">
          {vendors && vendors.length > 0 ? (
            <Command>
              <CommandInput placeholder="Search vendors..." />
              <CommandList>
                <CommandEmpty>No vendor found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="clear"
                    onSelect={handleClear}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !selectedVendorName ? "opacity-100" : "opacity-0"
                      )}
                    />
                    No vendor
                  </CommandItem>
                  {vendors.map((vendor) => (
                    <CommandItem
                      key={vendor.id}
                      value={vendor.name}
                      onSelect={() => handleSelect(vendor.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedVendorName === vendor.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {vendor.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {isLoading 
                ? "Loading vendors..." 
                : "No vendors available."}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VendorSelector;

