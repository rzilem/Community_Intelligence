
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { vendorComplianceService } from "@/services/vendor-compliance-service";
import { Plus, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import ComplianceDialog from "./ComplianceDialog";

interface VendorComplianceTabProps {
  vendorId: string;
}

const VendorComplianceTab: React.FC<VendorComplianceTabProps> = ({ vendorId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complianceItems = [], isLoading } = useQuery({
    queryKey: ['vendor-compliance', vendorId],
    queryFn: () => vendorComplianceService.getVendorCompliance(vendorId),
  });

  const deleteMutation = useMutation({
    mutationFn: vendorComplianceService.deleteComplianceItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-compliance', vendorId] });
      toast({ title: "Compliance item deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting compliance item", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
      not_applicable: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (expiry < today) return { status: 'expired', color: 'text-red-600', text: 'Expired' };
    if (expiry <= thirtyDaysFromNow) return { status: 'expiring', color: 'text-yellow-600', text: 'Expiring Soon' };
    return { status: 'valid', color: 'text-green-600', text: 'Valid' };
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading compliance items...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Compliance & Insurance</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Compliance Item
        </Button>
      </div>

      {complianceItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No compliance items found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {complianceItems.map((item) => {
            const expiryStatus = getExpiryStatus(item.expiry_date);
            
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <div>
                        <CardTitle className="text-lg">{item.item_name}</CardTitle>
                        <p className="text-sm text-gray-600 capitalize">
                          {item.compliance_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      {item.required && (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.description && (
                    <p className="text-gray-600 mb-4">{item.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {item.issue_date && (
                      <div>
                        <p className="font-medium">Issue Date</p>
                        <p className="text-gray-600">{format(new Date(item.issue_date), 'MMM dd, yyyy')}</p>
                      </div>
                    )}
                    {item.expiry_date && (
                      <div>
                        <p className="font-medium">Expiry Date</p>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-600">{format(new Date(item.expiry_date), 'MMM dd, yyyy')}</p>
                          {expiryStatus && (
                            <span className={`text-xs font-medium ${expiryStatus.color}`}>
                              {expiryStatus.text}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {item.verified_at && (
                      <div>
                        <p className="font-medium">Verified</p>
                        <p className="text-gray-600">{format(new Date(item.verified_at), 'MMM dd, yyyy')}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Renewal Notice</p>
                      <p className="text-gray-600">{item.renewal_notice_days} days</p>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{item.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingItem(item);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ComplianceDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        vendorId={vendorId}
        complianceItem={editingItem}
      />
    </div>
  );
};

export default VendorComplianceTab;
