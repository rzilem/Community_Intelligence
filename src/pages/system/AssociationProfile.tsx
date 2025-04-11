
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Building2, MapPin, Calendar, FileText, Users2, 
  Mail, Phone, Globe, Shield, Zap, Upload, Code, 
  AlertTriangle, ChevronLeft
} from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { useQuery } from '@tanstack/react-query';
import { fetchAssociationById } from '@/services/association-service';
import { Association, AssociationAIIssue } from '@/types/association-types';

const AssociationProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch the association data based on the ID parameter
  const { data: association, isLoading, error } = useQuery({
    queryKey: ['association', id],
    queryFn: () => fetchAssociationById(id || ''),
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching association:', error);
      toast.error('Failed to load association data');
    }
  }, [error]);
  
  // Mock AI issues - in a real app, these would be fetched from an API
  const aiIssues: AssociationAIIssue[] = [
    {
      id: '1',
      title: 'Invoice Approval Pending',
      description: 'There are 5 invoices awaiting approval for more than 7 days.',
      severity: 'high',
    },
    {
      id: '2',
      title: 'Security Certificates Expiring',
      description: 'SSL certificates for the resident portal will expire in 14 days.',
      severity: 'critical',
    },
    {
      id: '3',
      title: 'Compliance Notices Due',
      description: 'Annual compliance notices need to be sent to all homeowners by the end of the month.',
      severity: 'medium',
    },
    {
      id: '4',
      title: 'Resident Portal Usage Declining',
      description: 'Resident portal logins have decreased by 30% over the past month.',
      severity: 'low',
    }
  ];

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleBack = () => {
    navigate('/system/associations');
  };

  if (isLoading) {
    return (
      <PageTemplate 
        title="Association Profile" 
        icon={<Building2 className="h-8 w-8" />}
        description="Loading association details..."
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading association data...</p>
        </div>
      </PageTemplate>
    );
  }

  if (!association) {
    return (
      <PageTemplate 
        title="Association Not Found" 
        icon={<Building2 className="h-8 w-8" />}
        description="The requested association could not be found."
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">This association does not exist or you don't have permission to view it.</p>
              <Button className="mt-4" onClick={handleBack}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Associations
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={association.name} 
      icon={<Building2 className="h-8 w-8" />}
      description={`Manage ${association.name} association details, properties, and settings.`}
    >
      {/* Association Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 pb-4 border-b">
        <div className="flex items-start gap-3">
          <div>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {association.address ? `${association.address}, ` : ''}
                {association.city && association.state ? `${association.city}, ${association.state}` : 'No location data'}
                {association.zip ? ` ${association.zip}` : ''}
                {association.country ? `, ${association.country}` : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={association.is_archived ? "bg-gray-500" : "bg-green-500"}>
            {association.is_archived ? 'Inactive' : 'Active'}
          </Badge>
          <Button onClick={handleBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Associations
          </Button>
        </div>
      </div>

      {/* Association Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users2 className="h-5 w-5" />
                <span>Units</span>
              </div>
              <h3 className="text-2xl font-bold">{association.total_units || 'N/A'}</h3>
              <span className="text-sm text-muted-foreground">Total residential units</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-5 w-5" />
                <span>Onboarding Date</span>
              </div>
              <h3 className="text-2xl font-bold">{association.founded_date || 'N/A'}</h3>
              <span className="text-sm text-muted-foreground">
                {association.founded_date ? `Client since ${new Date(association.founded_date).getFullYear()}` : 'No date available'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-5 w-5" />
                <span>Legal Property Type</span>
              </div>
              <h3 className="text-lg font-bold">{association.property_type || 'Not specified'}</h3>
              <span className="text-sm text-muted-foreground">Property classification</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-5 w-5" />
                  <span>Association Workflows</span>
                </div>
              </div>
              <div className="mt-2">
                <Button className="flex items-center gap-2 w-full">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Workflow</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Association Photos Section */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Association Photos & 3D Views
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                View Photos
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                Manage Photos
              </Button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Add 3D Embed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Association Tabs Content */}
      <Tabs defaultValue="details" className="w-full mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          {/* General Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-6">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center">
                      <FileText className="h-4 w-4 mr-2" /> Association Type
                    </p>
                    <p className="font-medium">{association.property_type || 'HOA'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" /> Founded Date
                    </p>
                    <p className="font-medium">{association.founded_date || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center">
                      <Users2 className="h-4 w-4 mr-2" /> Total Units
                    </p>
                    <p className="font-medium">{association.total_units ? `${association.total_units} units` : 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center">
                      <Shield className="h-4 w-4 mr-2" /> Association ID
                    </p>
                    <p className="font-medium text-xs md:text-sm">{association.id}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" /> Address
                    </p>
                    <div>
                      {association.address && <p className="font-medium">{association.address}</p>}
                      {association.city && association.state && (
                        <p className="font-medium">{association.city}, {association.state} {association.zip || ''}</p>
                      )}
                      {association.country && <p className="font-medium">{association.country}</p>}
                      {!association.address && !association.city && <p className="font-medium">No address information</p>}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center">
                      <Mail className="h-4 w-4 mr-2" /> Email
                    </p>
                    <p className="font-medium">{association.contact_email || 'No email information'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center">
                      <Phone className="h-4 w-4 mr-2" /> Phone
                    </p>
                    <p className="font-medium">{association.phone || 'No phone information'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center">
                      <Globe className="h-4 w-4 mr-2" /> Website
                    </p>
                    {association.website ? (
                      <a 
                        href={association.website.startsWith('http') ? association.website : `https://${association.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {association.website}
                      </a>
                    ) : (
                      <p className="font-medium">No website information</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Association Description */}
              <div className="mt-8 border-t pt-6">
                <h4 className="font-semibold mb-3">Association Description</h4>
                <p className="text-muted-foreground">
                  {association.description || 'No description available for this association.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Critical Dates */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4">Critical Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Insurance Expiration</p>
                      <p className="font-semibold text-lg">{association.insurance_expiration || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fire Inspection Due</p>
                      <p className="font-semibold text-lg">{association.fire_inspection_due || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-600">AI Analysis</h3>
                </div>
                <Button variant="link" className="text-blue-600">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {aiIssues.map((issue) => (
                  <div key={issue.id} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{issue.title}</h4>
                          <Badge className={getSeverityBadgeColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{issue.description}</p>
                      </div>
                      <Button variant="default" size="sm">
                        Fix This
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financials">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4">Financial Information</h3>
              <p className="text-muted-foreground">Financial details will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="properties">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4">Properties</h3>
              <p className="text-muted-foreground">Properties in this association will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4">Documents</h3>
              <p className="text-muted-foreground">Association documents will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4">Members</h3>
              <p className="text-muted-foreground">Association members will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4">Association Settings</h3>
              <p className="text-muted-foreground">Settings for this association will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default AssociationProfile;
