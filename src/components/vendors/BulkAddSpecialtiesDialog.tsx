
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VENDOR_CATEGORIES, VendorCategory, Vendor } from '@/types/vendor-types';
import { useToast } from '@/hooks/use-toast';

interface BulkAddSpecialtiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVendors: Vendor[];
  onConfirm: (specialties: VendorCategory[]) => Promise<void>;
}

const BulkAddSpecialtiesDialog: React.FC<BulkAddSpecialtiesDialogProps> = ({
  open,
  onOpenChange,
  selectedVendors,
  onConfirm
}) => {
  const [selectedSpecialties, setSelectedSpecialties] = useState<VendorCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSpecialtyToggle = (specialty: VendorCategory) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleConfirm = async () => {
    if (selectedSpecialties.length === 0) {
      toast({
        title: "No specialties selected",
        description: "Please select at least one specialty to add.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(selectedSpecialties);
      setSelectedSpecialties([]);
      onOpenChange(false);
      toast({
        title: "Specialties added successfully",
        description: `Added ${selectedSpecialties.length} specialties to ${selectedVendors.length} vendors.`,
      });
    } catch (error) {
      toast({
        title: "Error adding specialties",
        description: "Failed to add specialties to vendors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedSpecialties([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Specialties to Selected Vendors</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adding specialties to {selectedVendors.length} selected vendor{selectedVendors.length !== 1 ? 's' : ''}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Vendors Preview */}
          <div>
            <Label className="text-sm font-medium">Selected Vendors:</Label>
            <ScrollArea className="h-20 w-full border rounded-md p-2 mt-1">
              <div className="flex flex-wrap gap-1">
                {selectedVendors.map(vendor => (
                  <Badge key={vendor.id} variant="outline" className="text-xs">
                    {vendor.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Specialty Selection */}
          <div>
            <Label className="text-sm font-medium">Select Specialties to Add:</Label>
            <ScrollArea className="h-60 w-full border rounded-md p-4 mt-1">
              <div className="grid grid-cols-2 gap-3">
                {VENDOR_CATEGORIES.map(specialty => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty}`}
                      checked={selectedSpecialties.includes(specialty)}
                      onCheckedChange={() => handleSpecialtyToggle(specialty)}
                    />
                    <Label 
                      htmlFor={`specialty-${specialty}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {specialty}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Specialties Preview */}
          {selectedSpecialties.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Specialties to Add:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedSpecialties.map(specialty => (
                  <Badge key={specialty} className="bg-blue-100 text-blue-800 border-blue-200">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting || selectedSpecialties.length === 0}
          >
            {isSubmitting ? "Adding..." : `Add to ${selectedVendors.length} Vendors`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddSpecialtiesDialog;
