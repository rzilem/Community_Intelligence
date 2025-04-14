
import React from 'react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { FileText, MapPin, Users, Calendar, ClipboardList } from 'lucide-react';
import { getCategoryImageUrl } from '@/services/bid-requests/bid-request-utils';

interface BidRequestReviewProps {
  formData: Partial<BidRequestWithVendors>;
}

const BidRequestReview: React.FC<BidRequestReviewProps> = ({ formData }) => {
  const { specifications = {}, locationData = { address: '', coordinates: null } } = formData;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Bid Request</CardTitle>
          <CardDescription>
            Review all the details of your bid request before submitting it to vendors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <ClipboardList className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                  <p className="text-base">{formData.title || 'No title provided'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  {formData.category ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-6 w-6 rounded overflow-hidden">
                        <img 
                          src={getCategoryImageUrl(formData.category)} 
                          alt={formData.category} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span>{formData.category}</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No category selected</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Budget</h4>
                  <p className="text-base">
                    {formData.budget ? formatCurrency(formData.budget) : 'No budget specified'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="text-base">
                    {formData.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                Location Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                  <p className="text-base">
                    {locationData.address || 'No address provided'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Location Notes</h4>
                  <p className="text-base">
                    {formData.locationNotes || 'No location notes provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2" />
              Project Specifications
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Project Goals</h4>
                  <p className="text-base">
                    {specifications.projectGoals || 'No project goals specified'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Material Requirements</h4>
                  <p className="text-base">
                    {specifications.materialRequirements || 'No material requirements specified'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Timeline Expectations</h4>
                  <p className="text-base">
                    {specifications.timelineExpectations || 'No timeline expectations specified'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
                  <p className="text-base">
                    {formData.dueDate ? format(new Date(formData.dueDate), 'PPP') : 'No due date specified'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Special Notes</h4>
                  <p className="text-base">
                    {specifications.specialNotes || 'No special notes provided'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Custom Questions</h4>
                  {specifications.customQuestions && specifications.customQuestions.length > 0 ? (
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {specifications.customQuestions.map((q, idx) => (
                        <li key={idx}>{q.question}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">No custom questions added</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Users className="h-5 w-5 mr-2" />
              Selected Vendors
            </h3>
            
            {formData.vendors && formData.vendors.length > 0 ? (
              <div className="space-y-2">
                <p>
                  <Badge variant="outline">{formData.vendors.length}</Badge> vendors selected
                </p>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Notes to Vendors</h4>
                  <p className="text-base">
                    {formData.vendorNotes || 'No notes to vendors provided'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic">No vendors selected</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BidRequestReview;
