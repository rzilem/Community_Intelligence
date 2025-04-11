
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, Users2, Shield, MapPin, Mail, Phone, Globe, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Association, AssociationAIIssue } from '@/types/association-types';
import { AIAnalysisSection } from './AIAnalysisSection';

interface GeneralInfoTabProps {
  association: Association;
  aiIssues: AssociationAIIssue[];
}

export const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ association, aiIssues }) => {
  return (
    <div className="space-y-6">
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
      <AIAnalysisSection aiIssues={aiIssues} />
    </div>
  );
};
