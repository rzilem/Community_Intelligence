
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Vendor } from "@/types/vendor-types";
import { Mail, Phone, Building } from "lucide-react";
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
              <Badge variant="default" className="ml-2 bg-blue-500">
                {vendor.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </h1>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(vendor.rating || 0) ? "text-yellow-400" : "text-gray-300"}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
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
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{vendor.phone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              {vendor.category && (
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{vendor.category}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No services information available.</p>
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
              <p className="text-muted-foreground">No insurance information available.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No notes available.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorProfileDetails;
