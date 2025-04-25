
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { usePermissions } from '@/hooks/users/usePermissions';

interface EditPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  menuId: string;
  submenuId?: string;
  featureName: string;
  currentAccess: 'full' | 'read' | 'none';
  onSave: (roleId: string, menuId: string, submenuId: string | undefined, access: 'full' | 'read' | 'none') => void;
}

type FormValues = {
  access: 'full' | 'read' | 'none';
};

export const EditPermissionDialog: React.FC<EditPermissionDialogProps> = ({
  open,
  onOpenChange,
  roleId,
  menuId,
  submenuId,
  featureName,
  currentAccess,
  onSave,
}) => {
  const { currentRole } = usePermissions();
  const isSystemAdmin = currentRole && currentRole.accessLevel === 'unrestricted';
  
  const form = useForm<FormValues>({
    defaultValues: {
      access: currentAccess,
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!isSystemAdmin) {
      toast.error("Only system administrators can modify permissions.");
      return;
    }
    
    onSave(roleId, menuId, submenuId, data.access);
    onOpenChange(false);
    toast.success(`Permission for ${featureName} updated successfully`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Permission: {featureName}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="access"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Access Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full" id="full" />
                        <Label htmlFor="full" className="font-normal">
                          Full Access <span className="text-xs text-muted-foreground">(View & Modify)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="read" id="read" />
                        <Label htmlFor="read" className="font-normal">
                          Read Only <span className="text-xs text-muted-foreground">(View Only)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none" className="font-normal">
                          No Access <span className="text-xs text-muted-foreground">(Hidden)</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isSystemAdmin}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
