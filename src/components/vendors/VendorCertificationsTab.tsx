
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { VendorCertificationFormData } from "@/types/vendor-extended-types";
import { Plus, Award, Calendar, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

interface VendorCertificationsTabProps {
  vendorId: string;
}

const VendorCertificationsTab: React.FC<VendorCertificationsTabProps> = ({ vendorId }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['vendor-certifications', vendorId],
    queryFn: () => vendorExtendedService.getVendorCertifications(vendorId),
  });

  const createCertificationMutation = useMutation({
    mutationFn: (data: VendorCertificationFormData) => 
      vendorExtendedService.createVendorCertification(vendorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-certifications', vendorId] });
      setIsAddDialogOpen(false);
      toast({ title: "Certification added successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error adding certification", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateCertificationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<VendorCertificationFormData> }) => 
      vendorExtendedService.updateVendorCertification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-certifications', vendorId] });
      setEditingCert(null);
      toast({ title: "Certification updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating certification", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteCertificationMutation = useMutation({
    mutationFn: (id: string) => vendorExtendedService.deleteVendorCertification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-certifications', vendorId] });
      toast({ title: "Certification deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting certification", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: VendorCertificationFormData = {
      certification_name: formData.get('certification_name') as string,
      issuing_authority: formData.get('issuing_authority') as string || undefined,
      certification_number: formData.get('certification_number') as string || undefined,
      issue_date: formData.get('issue_date') as string || undefined,
      expiry_date: formData.get('expiry_date') as string || undefined,
      status: formData.get('status') as any,
    };

    if (editingCert) {
      updateCertificationMutation.mutate({ id: editingCert.id, data });
    } else {
      createCertificationMutation.mutate(data);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading certifications...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Certifications</h3>
        <Dialog open={isAddDialogOpen || !!editingCert} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingCert(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCert ? 'Edit Certification' : 'Add Certification'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="certification_name">Certification Name</Label>
                <Input 
                  id="certification_name" 
                  name="certification_name" 
                  defaultValue={editingCert?.certification_name}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="issuing_authority">Issuing Authority</Label>
                <Input 
                  id="issuing_authority" 
                  name="issuing_authority"
                  defaultValue={editingCert?.issuing_authority}
                />
              </div>
              <div>
                <Label htmlFor="certification_number">Certification Number</Label>
                <Input 
                  id="certification_number" 
                  name="certification_number"
                  defaultValue={editingCert?.certification_number}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingCert?.status || 'active'} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input 
                    id="issue_date" 
                    name="issue_date" 
                    type="date"
                    defaultValue={editingCert?.issue_date}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input 
                    id="expiry_date" 
                    name="expiry_date" 
                    type="date"
                    defaultValue={editingCert?.expiry_date}
                  />
                </div>
              </div>
              <Button type="submit" disabled={createCertificationMutation.isPending || updateCertificationMutation.isPending}>
                {createCertificationMutation.isPending || updateCertificationMutation.isPending 
                  ? (editingCert ? 'Updating...' : 'Adding...') 
                  : (editingCert ? 'Update Certification' : 'Add Certification')
                }
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {certifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No certifications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {certifications.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{cert.certification_name}</h4>
                      <Badge className={getStatusColor(cert.status)}>
                        {cert.status}
                      </Badge>
                      {cert.expiry_date && isExpiringSoon(cert.expiry_date) && (
                        <Badge variant="destructive">Expiring Soon</Badge>
                      )}
                    </div>
                    
                    {cert.issuing_authority && (
                      <p className="text-sm text-gray-600 mb-1">
                        Issued by: {cert.issuing_authority}
                      </p>
                    )}
                    
                    {cert.certification_number && (
                      <p className="text-sm text-gray-600 mb-1">
                        Number: {cert.certification_number}
                      </p>
                    )}
                    
                    <div className="flex gap-4 text-sm text-gray-500">
                      {cert.issue_date && (
                        <span>Issued: {format(new Date(cert.issue_date), 'MMM dd, yyyy')}</span>
                      )}
                      {cert.expiry_date && (
                        <span>Expires: {format(new Date(cert.expiry_date), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingCert(cert)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteCertificationMutation.mutate(cert.id)}
                      disabled={deleteCertificationMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorCertificationsTab;
