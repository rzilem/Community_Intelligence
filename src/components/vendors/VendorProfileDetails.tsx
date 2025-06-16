
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExtendedVendor } from "@/types/vendor-extended-types";
import { Mail, Phone, Building, Star, Calendar, DollarSign, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import VendorDocumentsTab from "./VendorDocumentsTab";
import VendorCertificationsTab from "./VendorCertificationsTab";
import VendorReviewsTab from "./VendorReviewsTab";
import VendorEmergencyContactsTab from "./VendorEmergencyContactsTab";
import VendorAvailabilityTab from "./VendorAvailabilityTab";
import VendorPerformanceTab from "./VendorPerformanceTab";

interface VendorProfileDetailsProps {
  vendor: ExtendedVendor;
}

const VendorProfileDetails: React.FC<VendorProfileDetailsProps> = ({ vendor }) => {
  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (expiry < today) return { status: 'expired', color: 'bg-red-100 text-red-800' };
    if (expiry <= thirtyDaysFromNow) return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'valid', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      {/* Vendor Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold">
            {vendor.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {vendor.name}
              <Badge variant="default" className={vendor.is_active ? "bg-green-500" : "bg-gray-500"}>
                {vendor.is_active ? "Active" : "Inactive"}
              </Badge>
            </h1>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  size={16} 
                  className={i < Math.floor(vendor.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                />
              ))}
              <span className="ml-1 text-sm text-gray-500">{vendor.rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold">{vendor.total_jobs}</p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Jobs</p>
                <p className="text-2xl font-bold">{vendor.completed_jobs}</p>
              </div>
              <Star className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Response</p>
                <p className="text-2xl font-bold">
                  {vendor.average_response_time ? `${vendor.average_response_time}h` : 'N/A'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insurance & Bond Status */}
      {(vendor.insurance_expiry_date || vendor.bond_expiry_date) && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Insurance & Bond Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.insurance_expiry_date && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Insurance</p>
                    <p className="text-sm text-gray-500">
                      Expires: {format(new Date(vendor.insurance_expiry_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {(() => {
                    const status = getExpiryStatus(vendor.insurance_expiry_date);
                    return status ? (
                      <Badge className={status.color}>
                        {status.status === 'expired' ? 'Expired' : 
                         status.status === 'expiring' ? 'Expiring Soon' : 'Valid'}
                      </Badge>
                    ) : null;
                  })()}
                </div>
              )}
              
              {vendor.bond_expiry_date && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bond</p>
                    <p className="text-sm text-gray-500">
                      Amount: ${vendor.bond_amount?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires: {format(new Date(vendor.bond_expiry_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {(() => {
                    const status = getExpiryStatus(vendor.bond_expiry_date);
                    return status ? (
                      <Badge className={status.color}>
                        {status.status === 'expired' ? 'Expired' : 
                         status.status === 'expiring' ? 'Expiring Soon' : 'Valid'}
                      </Badge>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              
              {vendor.contact_person && (
                <div className="flex items-center mb-4">
                  <Building className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p>{vendor.contact_person}</p>
                  </div>
                </div>
              )}
              
              {vendor.email && (
                <div className="flex items-center mb-4">
                  <Mail className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{vendor.email}</p>
                  </div>
                </div>
              )}
              
              {vendor.phone && (
                <div className="flex items-center mb-4">
                  <Phone className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{vendor.phone}</p>
                  </div>
                </div>
              )}

              {vendor.address && (
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p>{vendor.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              
              {vendor.license_number && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">License Number</p>
                  <p>{vendor.license_number}</p>
                </div>
              )}

              {vendor.specialties && vendor.specialties.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {vendor.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-700">{vendor.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <VendorDocumentsTab vendorId={vendor.id} />
        </TabsContent>
        
        <TabsContent value="certifications">
          <VendorCertificationsTab vendorId={vendor.id} />
        </TabsContent>
        
        <TabsContent value="reviews">
          <VendorReviewsTab vendorId={vendor.id} />
        </TabsContent>
        
        <TabsContent value="contacts">
          <VendorEmergencyContactsTab vendorId={vendor.id} />
        </TabsContent>
        
        <TabsContent value="availability">
          <VendorAvailabilityTab vendorId={vendor.id} />
        </TabsContent>
        
        <TabsContent value="performance">
          <VendorPerformanceTab vendorId={vendor.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorProfileDetails;
