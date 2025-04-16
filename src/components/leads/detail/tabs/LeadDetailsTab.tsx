
import React from 'react';
import { Lead } from '@/types/lead-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createGoogleMapsLink } from '../address-utils';
import { getFormattedLeadAddressData } from '../lead-detail-utils';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { Calendar, Map, Users, DollarSign, Building, Phone, Mail } from 'lucide-react';

interface LeadDetailsTabProps {
  lead: Lead;
}

const LeadDetailsTab: React.FC<LeadDetailsTabProps> = ({ lead }) => {
  // Improve address formatting to handle various edge cases
  const formatAddress = () => {
    if (!lead.street_address) return '';

    // Clean up and format street address
    const streetAddress = lead.street_address.trim();
    
    // Combine city, state, and zip with proper spacing
    const cityStateZip = [
      lead.city?.trim(),
      lead.state?.trim(),
      lead.zip?.trim()
    ].filter(Boolean).join(', ');

    // Combine street address and city/state/zip
    return cityStateZip 
      ? `${streetAddress}, ${cityStateZip}` 
      : streetAddress;
  };

  // Data for lead type distribution chart
  const leadsData = [
    { name: 'New', value: 35 },
    { name: 'Contacted', value: 25 },
    { name: 'Qualified', value: 20 },
    { name: 'Proposal', value: 15 },
    { name: 'Converted', value: 5 }
  ];

  // Highlight the current lead status in the chart
  const highlightedLeadsData = leadsData.map(item => ({
    ...item,
    value: item.name.toLowerCase() === lead.status ? item.value + 10 : item.value,
    isHighlighted: item.name.toLowerCase() === lead.status
  }));

  const chartColors = ['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C', '#D6BCFA'];

  return (
    <div className="space-y-8">
      {/* Full-width card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium mb-4">Contact Information</h4>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                    <dd>{lead.name}</dd>
                  </div>
                  {lead.first_name && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">First Name</dt>
                      <dd>{lead.first_name}</dd>
                    </div>
                  )}
                  {lead.last_name && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Last Name</dt>
                      <dd>{lead.last_name}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd>{lead.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                    <dd>{lead.phone || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                    <dd>{lead.company || 'Not provided'}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">Lead Information</h4>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Source</dt>
                    <dd>{lead.source}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="capitalize">{lead.status}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                    <dd>{new Date(lead.created_at).toLocaleDateString()}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                    <dd>{new Date(lead.updated_at).toLocaleDateString()}</dd>
                  </div>
                  
                  {lead.tracking_number && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Tracking Number</dt>
                      <dd>{lead.tracking_number}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Association Information</h4>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Association Name</dt>
                  <dd>{lead.association_name || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Association Type</dt>
                  <dd>{lead.association_type || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Number of Units</dt>
                  <dd>{lead.number_of_units || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Current Management</dt>
                  <dd>{lead.current_management || 'Not provided'}</dd>
                </div>
                
                {/* Combined address information */}
                <div className="pt-4 border-t mt-2">
                  <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                  <dd className="mt-1">
                    {formatAddress() ? (
                      <div className="flex items-center">
                        <span>{formatAddress()}</span>
                        {lead.street_address && (
                          <a 
                            href={createGoogleMapsLink(lead.street_address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 text-blue-600 hover:underline"
                          >
                            Map It
                          </a>
                        )}
                      </div>
                    ) : (
                      'Not provided'
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphical Lead Information Display */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Lead Insights</h3>
        
        {/* Lead Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <Building className="h-5 w-5 text-blue-700" />
              </div>
              <h4 className="font-medium">Association</h4>
            </div>
            <div className="ml-11">
              <p className="text-lg font-semibold">{lead.association_name || 'Not specified'}</p>
              <p className="text-sm text-gray-500">{lead.association_type || 'Type not specified'}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-purple-100 mr-3">
                <Users className="h-5 w-5 text-purple-700" />
              </div>
              <h4 className="font-medium">Units</h4>
            </div>
            <div className="ml-11">
              <p className="text-lg font-semibold">{lead.number_of_units || 'Not specified'}</p>
              <p className="text-sm text-gray-500">Total units in association</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-100 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-green-100 mr-3">
                <Calendar className="h-5 w-5 text-green-700" />
              </div>
              <h4 className="font-medium">Timeline</h4>
            </div>
            <div className="ml-11">
              <p className="text-lg font-semibold">{new Date(lead.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Lead created</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-100 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-amber-100 mr-3">
                <Map className="h-5 w-5 text-amber-700" />
              </div>
              <h4 className="font-medium">Location</h4>
            </div>
            <div className="ml-11">
              <p className="text-lg font-semibold">{lead.city || 'Not specified'}</p>
              <p className="text-sm text-gray-500">{lead.state || 'State not specified'}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-100 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-red-100 mr-3">
                <Phone className="h-5 w-5 text-red-700" />
              </div>
              <h4 className="font-medium">Contact</h4>
            </div>
            <div className="ml-11">
              <p className="text-lg font-semibold">{lead.phone || 'Not provided'}</p>
              <p className="text-sm text-gray-500">Primary contact</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-100 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-cyan-100 mr-3">
                <Mail className="h-5 w-5 text-cyan-700" />
              </div>
              <h4 className="font-medium">Email</h4>
            </div>
            <div className="ml-11">
              <p className="text-lg font-semibold truncate max-w-xs">{lead.email}</p>
              <p className="text-sm text-gray-500">Primary email</p>
            </div>
          </div>
        </div>
        
        {/* Lead Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <PieChart 
                  data={highlightedLeadsData}
                  category="value"
                  index="name"
                  colors={chartColors}
                  valueFormatter={(value) => `${value}%`}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Lead Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                <div className="w-full max-w-md">
                  <div className="relative">
                    <div className="absolute h-full w-1 bg-gray-200 left-4"></div>
                    
                    <div className="ml-10 space-y-6 relative">
                      <div className="relative">
                        <div className="absolute -left-10 mt-1.5">
                          <div className="h-3 w-3 rounded-full bg-green-500 border-4 border-white shadow"></div>
                        </div>
                        <h4 className="font-medium">Created</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()} - {new Date(lead.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-10 mt-1.5">
                          <div className="h-3 w-3 rounded-full bg-blue-500 border-4 border-white shadow"></div>
                        </div>
                        <h4 className="font-medium">Updated</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(lead.updated_at).toLocaleDateString()} - {new Date(lead.updated_at).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-10 mt-1.5">
                          <div className={`h-3 w-3 rounded-full ${
                            lead.status === 'converted' ? 'bg-purple-500' : 
                            lead.status === 'lost' ? 'bg-red-500' : 
                            'bg-amber-500'
                          } border-4 border-white shadow`}></div>
                        </div>
                        <h4 className="font-medium">Current Status</h4>
                        <p className="text-sm capitalize font-medium" style={{ color: lead.status === 'converted' ? '#8B5CF6' : lead.status === 'lost' ? '#EF4444' : '#F59E0B' }}>
                          {lead.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsTab;
