
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Vendor } from "@/types/vendor-types";
import { Mail, Phone, Building, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VendorProfileDetailsProps {
  vendor: Vendor;
}

const VendorProfileDetails: React.FC<VendorProfileDetailsProps> = ({ vendor }) => {
  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Jobs</p>
                  <p className="text-2xl font-bold">{vendor.total_jobs}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Jobs</p>
                  <p className="text-2xl font-bold">{vendor.completed_jobs}</p>
                </div>
              </div>
              {vendor.average_response_time && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Average Response Time</p>
                  <p>{vendor.average_response_time} hours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No documents available.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insurance">
          <Card>
            <CardContent className="pt-6">
              {vendor.insurance_info ? (
                <div className="space-y-4">
                  {vendor.insurance_info.provider && (
                    <div>
                      <p className="text-sm text-gray-500">Provider</p>
                      <p>{vendor.insurance_info.provider}</p>
                    </div>
                  )}
                  {vendor.insurance_info.policy_number && (
                    <div>
                      <p className="text-sm text-gray-500">Policy Number</p>
                      <p>{vendor.insurance_info.policy_number}</p>
                    </div>
                  )}
                  {vendor.insurance_info.coverage_amount && (
                    <div>
                      <p className="text-sm text-gray-500">Coverage Amount</p>
                      <p>${vendor.insurance_info.coverage_amount.toLocaleString()}</p>
                    </div>
                  )}
                  {vendor.insurance_info.expiration_date && (
                    <div>
                      <p className="text-sm text-gray-500">Expiration Date</p>
                      <p>{vendor.insurance_info.expiration_date}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No insurance information available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              {vendor.notes ? (
                <p>{vendor.notes}</p>
              ) : (
                <p className="text-muted-foreground">No notes available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorProfileDetails;
