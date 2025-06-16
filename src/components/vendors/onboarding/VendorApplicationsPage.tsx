
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { vendorApplicationService } from "@/services/vendor-application-service";
import { Search, UserPlus, Calendar, Building, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import ApplicationDialog from "./ApplicationDialog";

const VendorApplicationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentAssociation } = useAuth();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['vendor-applications', currentAssociation?.id],
    queryFn: () => vendorApplicationService.getApplications(currentAssociation?.id!),
    enabled: !!currentAssociation?.id,
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === "" || 
      app.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.application_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      requires_info: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vendor Applications</h1>
          <p className="text-gray-600">Review and manage vendor applications</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="requires_info">Requires Info</option>
        </select>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No vendor applications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Building className="h-5 w-5 text-gray-400" />
                      {application.business_name}
                    </CardTitle>
                    <p className="text-gray-600">{application.contact_person}</p>
                  </div>
                  <Badge className={getStatusColor(application.application_status)}>
                    {application.application_status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{application.email}</span>
                  </div>
                  {application.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{application.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Submitted {format(new Date(application.submitted_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>

                {application.specialties && application.specialties.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {application.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {application.years_in_business && (
                    <div>
                      <p className="font-medium">Years in Business</p>
                      <p className="text-gray-600">{application.years_in_business}</p>
                    </div>
                  )}
                  {application.license_number && (
                    <div>
                      <p className="font-medium">License Number</p>
                      <p className="text-gray-600">{application.license_number}</p>
                    </div>
                  )}
                  {application.insurance_provider && (
                    <div>
                      <p className="font-medium">Insurance Provider</p>
                      <p className="text-gray-600">{application.insurance_provider}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Background Check</p>
                    <Badge 
                      variant="outline" 
                      className={
                        application.background_check_status === 'completed' ? 'bg-green-50 text-green-700' :
                        application.background_check_status === 'failed' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                      }
                    >
                      {application.background_check_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {application.qualification_score && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Qualification Score:</span> {application.qualification_score}/100
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ApplicationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default VendorApplicationsPage;
