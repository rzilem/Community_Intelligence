
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorIntegrationService } from "@/services/vendor-integration-service";

interface VendorIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
}

const VendorIntegrationDialog: React.FC<VendorIntegrationDialogProps> = ({
  open,
  onOpenChange,
  vendorId
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    integration_name: '',
    integration_type: 'api' as const,
    configuration: {},
    credentials: {},
    is_active: true
  });

  const createMutation = useMutation({
    mutationFn: vendorIntegrationService.createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-integrations', vendorId] });
      onOpenChange(false);
      toast({ title: "Integration created successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Error creating integration", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      integration_name: '',
      integration_type: 'api',
      configuration: {},
      credentials: {},
      is_active: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createMutation.mutate({
      ...formData,
      vendor_id: vendorId,
      sync_status: 'pending' as const
    });
  };

  const getConfigurationFields = () => {
    switch (formData.integration_type) {
      case 'api':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="api_url">API URL</Label>
              <Input
                id="api_url"
                placeholder="https://api.example.com"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, api_url: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Enter API key"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  credentials: { ...prev.credentials, api_key: e.target.value }
                }))}
              />
            </div>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                placeholder="smtp.gmail.com"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, smtp_host: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                type="number"
                placeholder="587"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, smtp_port: parseInt(e.target.value) }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="email_username">Username</Label>
              <Input
                id="email_username"
                placeholder="username@example.com"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  credentials: { ...prev.credentials, username: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="email_password">Password</Label>
              <Input
                id="email_password"
                type="password"
                placeholder="Enter password"
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  credentials: { ...prev.credentials, password: e.target.value }
                }))}
              />
            </div>
          </div>
        );
      default:
        return (
          <div>
            <Label htmlFor="config_json">Configuration (JSON)</Label>
            <Textarea
              id="config_json"
              placeholder='{"key": "value"}'
              rows={4}
              onChange={(e) => {
                try {
                  const config = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, configuration: config }));
                } catch {
                  // Invalid JSON, ignore
                }
              }}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Integration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="integration_name">Integration Name</Label>
              <Input 
                id="integration_name" 
                value={formData.integration_name}
                onChange={(e) => setFormData(prev => ({ ...prev, integration_name: e.target.value }))}
                placeholder="My API Integration"
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="integration_type">Integration Type</Label>
              <Select 
                value={formData.integration_type} 
                onValueChange={(value: any) => setFormData(prev => ({ 
                  ...prev, 
                  integration_type: value,
                  configuration: {},
                  credentials: {}
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">API Integration</SelectItem>
                  <SelectItem value="email">Email Integration</SelectItem>
                  <SelectItem value="portal">Web Portal</SelectItem>
                  <SelectItem value="accounting">Accounting System</SelectItem>
                  <SelectItem value="calendar">Calendar System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {getConfigurationFields()}

          <div className="flex items-center space-x-2">
            <Switch 
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Activate integration immediately</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Integration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorIntegrationDialog;
