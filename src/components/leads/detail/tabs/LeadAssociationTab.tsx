
import React, { useState, FormEvent } from 'react';
import { Lead } from '@/types/lead-types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CalendarIcon, Search, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface LeadAssociationTabProps {
  lead: Lead;
  onAssociationUpdate?: (data: Partial<Lead>) => void;
}

const LeadAssociationTab: React.FC<LeadAssociationTabProps> = ({ lead, onAssociationUpdate }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({
    // Basic Association Information
    association_name: lead.association_name || '',
    association_type: lead.association_type || '',
    number_of_units: lead.number_of_units,
    current_management: lead.current_management || '',
    management_type: lead.management_type || '',
    new_build_or_existing: lead.new_build_or_existing,
    
    // Board & Meeting Information
    board_members: lead.board_members || '',
    board_meetings_per_year: lead.board_meetings_per_year || '',
    annual_meetings_per_year: lead.annual_meetings_per_year || '',
    committee_meetings_per_year: lead.committee_meetings_per_year || '',
    scheduled_meetings: lead.scheduled_meetings || '',
    sos_url: lead.sos_url || '',
    
    // Management Information
    onsite_management_office: lead.onsite_management_office || 'no',
    regional_visits_per_month: lead.regional_visits_per_month || '',
    inspections_per_month: lead.inspections_per_month || '',
    has_received_notice: lead.has_received_notice,
    previous_management_company: lead.previous_management_company || '',
    active_projects: lead.active_projects || '',
    
    // Legal Information
    collection_attorney: lead.collection_attorney || '',
    collection_assigned_attorney: lead.collection_assigned_attorney || '',
    current_lawsuits: lead.current_lawsuits || '',
    current_insurance_claims: lead.current_insurance_claims || '',
    current_special_assessments: lead.current_special_assessments || '',
    contact_info_legal: lead.contact_info_legal || '',
    contract_link: lead.contract_link || '',
    
    // Financial Information
    billing_type: lead.billing_type || '',
    billing_cycle: lead.billing_cycle || '',
    annual_budget: lead.annual_budget || '',
    fein_number: lead.fein_number || '',
    cash_on_hand: lead.cash_on_hand || '',
    financial_grade: lead.financial_grade || '',
    reserves: lead.reserves || 'no',
    insurance_expiration_date: lead.insurance_expiration_date || '',
    ballpark_on_funds: lead.ballpark_on_funds || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (onAssociationUpdate) {
      // Filter out empty string values to avoid overwriting existing data with empty strings
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      onAssociationUpdate(cleanedData);
    } else {
      toast.error('Update functionality not available');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6 pb-8">
          {/* Basic Association Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Association Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <Label htmlFor="association_name">Association Name</Label>
                  <Input 
                    id="association_name" 
                    value={formData.association_name} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="association_type">Association Type</Label>
                  <Input 
                    id="association_type" 
                    value={formData.association_type} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="number_of_units">Number of Units</Label>
                  <Input 
                    id="number_of_units" 
                    type="number"
                    value={formData.number_of_units || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="current_management">Current Management</Label>
                  <Input 
                    id="current_management" 
                    value={formData.current_management} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="management_type">Management Type</Label>
                  <Select 
                    value={formData.management_type || ''} 
                    onValueChange={(value) => handleSelectChange('management_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">--Select--</SelectItem>
                      <SelectItem value="on-site">On-Site</SelectItem>
                      <SelectItem value="portfolio">Portfolio</SelectItem>
                      <SelectItem value="portfolio-with-staff">Portfolio w/ Staff</SelectItem>
                      <SelectItem value="financial-service-only">Financial Service Only</SelectItem>
                      <SelectItem value="accounting-only">Accounting Only</SelectItem>
                      <SelectItem value="pt-onsite">PT Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new_build_or_existing">New Build or Existing</Label>
                  <Select 
                    value={formData.new_build_or_existing || ''} 
                    onValueChange={(value) => handleSelectChange('new_build_or_existing', value as 'new-build' | 'existing')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">--Select--</SelectItem>
                      <SelectItem value="new-build">New Build</SelectItem>
                      <SelectItem value="existing">Existing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Board and Meetings Information */}
          <Card>
            <CardHeader>
              <CardTitle>Board & Meeting Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <Label htmlFor="board_members">Board Member/Emails/Positions/Term Dates</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="board_members" 
                      placeholder="Enter board member details" 
                      value={formData.board_members}
                      onChange={handleInputChange}
                    />
                    <Button variant="outline" size="icon" title="Add board members" type="button">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="board_meetings_per_year">Board Meetings Per Year</Label>
                  <Select 
                    value={formData.board_meetings_per_year || ''} 
                    onValueChange={(value) => handleSelectChange('board_meetings_per_year', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">--Select--</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="annual_meetings_per_year">Annual Meetings Per Year</Label>
                  <Input 
                    id="annual_meetings_per_year" 
                    placeholder="Enter number" 
                    value={formData.annual_meetings_per_year}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="committee_meetings_per_year">Committee Meetings Per Year</Label>
                  <Select 
                    value={formData.committee_meetings_per_year || ''} 
                    onValueChange={(value) => handleSelectChange('committee_meetings_per_year', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">--Select--</SelectItem>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1-3">1-3</SelectItem>
                      <SelectItem value="4-6">4-6</SelectItem>
                      <SelectItem value="7-12">7-12</SelectItem>
                      <SelectItem value="12+">12+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled_meetings">Scheduled Meetings</Label>
                  <Input 
                    id="scheduled_meetings" 
                    placeholder="Enter scheduled meetings" 
                    value={formData.scheduled_meetings}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="sos_url">SOS Url</Label>
                  <Input 
                    id="sos_url" 
                    placeholder="Enter SOS URL" 
                    value={formData.sos_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management Details */}
          <Card>
            <CardHeader>
              <CardTitle>Management Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <Label htmlFor="onsite_management_office">Onsite Management Office</Label>
                  <Select 
                    value={formData.onsite_management_office || 'no'} 
                    onValueChange={(value) => handleSelectChange('onsite_management_office', value as 'yes' | 'no')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="regional_visits_per_month">Regional Visits Per Month</Label>
                  <Select 
                    value={formData.regional_visits_per_month || ''} 
                    onValueChange={(value) => handleSelectChange('regional_visits_per_month', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">--Select--</SelectItem>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4+">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="inspections_per_month">Inspections Per Month</Label>
                  <Input 
                    id="inspections_per_month" 
                    placeholder="Enter number" 
                    value={formData.inspections_per_month}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="has_received_notice">Has Mgmt Received Notice</Label>
                  <Select 
                    value={formData.has_received_notice || ''} 
                    onValueChange={(value) => handleSelectChange('has_received_notice', value as 'yes' | 'no' | 'pending')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">--Select--</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="previous_management_company">Previous Management Company</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="previous_management_company" 
                      placeholder="Search for company" 
                      value={formData.previous_management_company}
                      onChange={handleInputChange}
                    />
                    <Button variant="outline" size="icon" title="Search companies" type="button">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="active_projects">Active Projects</Label>
                  <Input 
                    id="active_projects" 
                    placeholder="Enter active projects" 
                    value={formData.active_projects}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Legal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <Label htmlFor="collection_attorney">Collection Attorney</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="collection_attorney" 
                      placeholder="Search for attorney" 
                      value={formData.collection_attorney}
                      onChange={handleInputChange}
                    />
                    <Button variant="outline" size="icon" title="Search attorneys" type="button">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="collection_assigned_attorney">Collection Assigned Attorney</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="collection_assigned_attorney" 
                      placeholder="Search for attorney" 
                      value={formData.collection_assigned_attorney}
                      onChange={handleInputChange}
                    />
                    <Button variant="outline" size="icon" title="Search attorneys" type="button">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="current_lawsuits">Current Lawsuits</Label>
                  <Input 
                    id="current_lawsuits" 
                    placeholder="Enter information" 
                    value={formData.current_lawsuits}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="current_insurance_claims">Current Insurance Claims</Label>
                  <Input 
                    id="current_insurance_claims" 
                    placeholder="Enter information" 
                    value={formData.current_insurance_claims}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="current_special_assessments">Current Special Assessments</Label>
                  <Input 
                    id="current_special_assessments" 
                    placeholder="Enter information" 
                    value={formData.current_special_assessments}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_info_legal">Contact Info for Attorneys and Insurance Comp</Label>
                  <Input 
                    id="contact_info_legal" 
                    placeholder="Enter contact information" 
                    value={formData.contact_info_legal}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contract_link">Link to Contract</Label>
                  <Input 
                    id="contract_link" 
                    placeholder="Enter URL" 
                    value={formData.contract_link}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <Label htmlFor="billing_type">Billing Type</Label>
                  <Select 
                    value={formData.billing_type || ''} 
                    onValueChange={(value) => handleSelectChange('billing_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">--Select--</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billing_cycle">Billing Cycle</Label>
                  <Select 
                    value={formData.billing_cycle || ''} 
                    onValueChange={(value) => handleSelectChange('billing_cycle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">--Select--</SelectItem>
                      <SelectItem value="1st">1st of month</SelectItem>
                      <SelectItem value="15th">15th of month</SelectItem>
                      <SelectItem value="last-day">Last day of month</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="annual_budget">Annual Budget</Label>
                  <Input 
                    id="annual_budget" 
                    placeholder="Enter amount" 
                    value={formData.annual_budget}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="fein_number">FEIN Number</Label>
                  <Input 
                    id="fein_number" 
                    placeholder="XX-XXXXXXX" 
                    value={formData.fein_number}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="cash_on_hand">Cash On Hand</Label>
                  <Input 
                    id="cash_on_hand" 
                    placeholder="Enter amount" 
                    value={formData.cash_on_hand}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="financial_grade">Financial Grade</Label>
                  <Select 
                    value={formData.financial_grade || ''} 
                    onValueChange={(value) => handleSelectChange('financial_grade', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">--Select--</SelectItem>
                      <SelectItem value="A">A - Excellent</SelectItem>
                      <SelectItem value="B">B - Good</SelectItem>
                      <SelectItem value="C">C - Average</SelectItem>
                      <SelectItem value="D">D - Poor</SelectItem>
                      <SelectItem value="F">F - Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reserves">Reserves</Label>
                  <Select 
                    value={formData.reserves || 'no'} 
                    onValueChange={(value) => handleSelectChange('reserves', value as 'yes' | 'no' | 'partial')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="insurance_expiration_date">Insurance Expiration Date</Label>
                  <div className="relative">
                    <Input 
                      id="insurance_expiration_date" 
                      placeholder="Select date" 
                      value={formData.insurance_expiration_date}
                      onChange={handleInputChange}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0"
                      type="button"
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="ballpark_on_funds">Ballpark on Funds</Label>
                  <Input 
                    id="ballpark_on_funds" 
                    placeholder="Enter information" 
                    value={formData.ballpark_on_funds}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <div className="flex justify-end py-4 sticky bottom-0 bg-background border-t px-4 -mx-4">
        <Button type="submit" className="flex gap-2 items-center">
          <Save className="h-4 w-4" />
          Save Association Details
        </Button>
      </div>
    </form>
  );
};

export default LeadAssociationTab;
