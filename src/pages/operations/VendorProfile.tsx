
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { ArrowLeft, MapPin, Phone, Mail, Star, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import VendorEditDialog from "@/components/vendors/VendorEditDialog";
import VendorDocumentsTab from "@/components/vendors/VendorDocumentsTab";
import VendorPerformanceTab from "@/components/vendors/VendorPerformanceTab";
import VendorReviewsTab from "@/components/vendors/VendorReviewsTab";
import VendorAvailabilityTab from "@/components/vendors/VendorAvailabilityTab";
import VendorCertificationsTab from "@/components/vendors/VendorCertificationsTab";
import VendorEmergencyContactsTab from "@/components/vendors/VendorEmergencyContactsTab";
import VendorContractsTab from "@/components/vendors/contracts/VendorContractsTab";
import VendorComplianceTab from "@/components/vendors/compliance/VendorComplianceTab";
import VendorAnalyticsDashboard from "@/components/vendors/analytics/VendorAnalyticsDashboard";
import WorkflowAutomationTab from "@/components/vendors/workflows/WorkflowAutomationTab";

const VendorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor-extended', id],
    queryFn: () => vendorExtendedService.getExtendedVendorById(id!),
    enabled: !!id,
  });

  const handleSave = () => {
    // Refresh data after save
    // This will be handled by the dialog's mutation
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading vendor profile...</div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Vendor Not Found</h2>
          <p className="text-gray-600 mb-4">The vendor you're looking for doesn't exist.</p>
          <Link to="/operations/vendors">
            <Button>Back to Vendors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/operations/vendors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Button>
        </Link>
      </div>

      {/* Vendor Header Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              {vendor.logo_url && (
                <img 
                  src={vendor.logo_url} 
                  alt={`${vendor.name} logo`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {vendor.name}
                  {vendor.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-medium">{vendor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vendor.specialties?.map((specialty, index) => (
                    <Badge key={index} variant="outline">{specialty}</Badge>
                  ))}
                  {!vendor.is_active && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Vendor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendor.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{vendor.email}</span>
              </div>
            )}
            {vendor.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{vendor.phone}</span>
              </div>
            )}
            {vendor.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{vendor.address}</span>
              </div>
            )}
          </div>
          
          {vendor.notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-gray-700">{vendor.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vendor.total_jobs}</div>
              <div className="text-sm text-gray-500">Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{vendor.completed_jobs}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {vendor.average_response_time ? `${vendor.average_response_time}h` : 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {vendor.total_jobs > 0 ? `${((vendor.completed_jobs / vendor.total_jobs) * 100).toFixed(1)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <VendorAnalyticsDashboard vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <VendorDocumentsTab vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <VendorPerformanceTab vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          <VendorContractsTab vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <VendorComplianceTab vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <WorkflowAutomationTab />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <VendorReviewsTab vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <VendorAvailabilityTab vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <VendorCertificationsTab vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="emergency" className="mt-6">
          <VendorEmergencyContactsTab vendorId={vendor.id} />
        </TabsContent>
      </Tabs>

      <VendorEditDialog 
        vendor={vendor}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
};

export default VendorProfile;
