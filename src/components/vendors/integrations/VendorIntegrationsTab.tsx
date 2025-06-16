
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { vendorIntegrationService } from "@/services/vendor-integration-service";
import { Plus, Settings, RefreshCw, TestTube, AlertCircle, CheckCircle, Clock } from "lucide-react";
import VendorIntegrationDialog from "./VendorIntegrationDialog";

interface VendorIntegrationsTabProps {
  vendorId: string;
}

const VendorIntegrationsTab: React.FC<VendorIntegrationsTabProps> = ({
  vendorId
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['vendor-integrations', vendorId],
    queryFn: () => vendorIntegrationService.getVendorIntegrations(vendorId),
  });

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'api': return '🔗';
      case 'email': return '📧';
      case 'portal': return '🌐';
      case 'accounting': return '💰';
      case 'calendar': return '📅';
      default: return '🔧';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'syncing': return <Clock className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Vendor Integrations</h3>
          <p className="text-muted-foreground">
            Manage third-party integrations and API connections
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {/* Integrations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations?.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getIntegrationIcon(integration.integration_type)}</span>
                  <div>
                    <CardTitle className="text-lg">{integration.integration_name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {integration.integration_type.toUpperCase()}
                      </Badge>
                      <div className={`flex items-center space-x-1 ${getSyncStatusColor(integration.sync_status)}`}>
                        {getSyncStatusIcon(integration.sync_status)}
                        <span className="text-sm capitalize">{integration.sync_status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Switch 
                  checked={integration.is_active}
                  onCheckedChange={(checked) => {
                    // Handle integration activation/deactivation
                    console.log('Toggle integration:', integration.id, checked);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integration.last_sync && (
                  <div className="text-sm text-muted-foreground">
                    Last sync: {new Date(integration.last_sync).toLocaleString()}
                  </div>
                )}
                
                {integration.error_message && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {integration.error_message}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await vendorIntegrationService.testIntegration(integration.id);
                          console.log('Test result:', result);
                        } catch (error) {
                          console.error('Test failed:', error);
                        }
                      }}
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await vendorIntegrationService.syncIntegration(integration.id);
                        } catch (error) {
                          console.error('Sync failed:', error);
                        }
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Sync
                    </Button>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Integration Card */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-8 text-center">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Add Integration</h3>
            <p className="text-muted-foreground mb-4">
              Connect with third-party services and APIs
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Add Integration
            </Button>
          </CardContent>
        </Card>
      </div>

      {(!integrations || integrations.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Integrations</h3>
            <p className="text-muted-foreground mb-4">
              Connect this vendor with third-party services and APIs to streamline operations.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Integration
            </Button>
          </CardContent>
        </Card>
      )}

      <VendorIntegrationDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        vendorId={vendorId}
      />
    </div>
  );
};

export default VendorIntegrationsTab;
