
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { HelpCircle, BookOpen, FileQuestion, MessageSquareHelp, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const Help = () => {
  return (
    <PageTemplate 
      title="Help Center" 
      icon={<HelpCircle className="h-8 w-8" />}
      description="Access documentation, support resources, and contact information."
    >
      <Tabs defaultValue="documentation" className="w-full mt-6">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documentation">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 mb-4 text-primary" />
                <CardTitle>User Guide</CardTitle>
                <CardDescription>Comprehensive documentation for all features</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Learn how to navigate the system, manage properties, residents, and more with our comprehensive user guide.
                </p>
                <Button variant="outline" className="w-full">Open User Guide</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <FileQuestion className="h-8 w-8 mb-4 text-primary" />
                <CardTitle>Admin Guide</CardTitle>
                <CardDescription>Advanced configuration and management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Advanced documentation for administrators covering system configuration, user permissions, and custom workflows.
                </p>
                <Button variant="outline" className="w-full">Open Admin Guide</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <MessageSquareHelp className="h-8 w-8 mb-4 text-primary" />
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>For developers and integrators</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Technical documentation for developers integrating with our API, including endpoints, authentication, and examples.
                </p>
                <Button variant="outline" className="w-full">View API Docs</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-lg">How do I add a new property?</h3>
                <p className="text-muted-foreground mt-2">
                  Navigate to the Properties page and click the "Add Property" button in the top right. Fill out the required information in the form and click "Save".
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">How can I reset my password?</h3>
                <p className="text-muted-foreground mt-2">
                  Click on your profile icon in the top right, select "Profile", and then click the "Change Password" button. You'll need to enter your current password and the new password.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">How do I generate financial reports?</h3>
                <p className="text-muted-foreground mt-2">
                  Go to the Accounting section, select "Financial Reports", and use the filter options to select the date range and report type you need. Then click "Generate Report".
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Can I export data to Excel?</h3>
                <p className="text-muted-foreground mt-2">
                  Yes, most tables include an export option. Look for the "Export" or download icon in the table headers. You can typically export to CSV, Excel, or PDF formats.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tutorials">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>Step-by-step visual guides</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Getting Started Tour</h3>
                  <p className="text-sm text-muted-foreground mb-2">A complete overview of the platform and its key features.</p>
                  <Button variant="outline" size="sm">Watch Video (10:23)</Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Managing Properties</h3>
                  <p className="text-sm text-muted-foreground mb-2">Learn how to add, edit, and manage properties effectively.</p>
                  <Button variant="outline" size="sm">Watch Video (8:45)</Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Financial Management</h3>
                  <p className="text-sm text-muted-foreground mb-2">Overview of accounting features and financial reporting.</p>
                  <Button variant="outline" size="sm">Watch Video (15:12)</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interactive Walkthroughs</CardTitle>
                <CardDescription>Guide tooltips directly in the application</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-muted-foreground">
                  Our interactive tutorials provide step-by-step guidance within the application itself. Click on any of the tutorials below to start a guided tour.
                </p>
                
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    New User Onboarding
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Creating Your First HOA
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Setting Up Bank Accounts
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Building Resident Profiles
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help from our team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-md p-6">
                  <Phone className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-medium text-lg mb-2">Phone Support</h3>
                  <p className="text-muted-foreground mb-4">
                    Available Monday-Friday, 8am-6pm ET
                  </p>
                  <p className="font-medium">1-800-123-4567</p>
                </div>
                
                <div className="border rounded-md p-6">
                  <MessageSquareHelp className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-medium text-lg mb-2">Email Support</h3>
                  <p className="text-muted-foreground mb-4">
                    24/7 response, typically within 4 hours
                  </p>
                  <p className="font-medium">support@communityintelligence.com</p>
                </div>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="font-medium text-lg mb-4">Submit a Support Ticket</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                      <select id="subject" className="w-full p-2 border rounded-md">
                        <option value="">Select issue type...</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing Question</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="urgency" className="block text-sm font-medium mb-1">Urgency</label>
                      <select id="urgency" className="w-full p-2 border rounded-md">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                    <textarea 
                      id="description" 
                      rows={4} 
                      className="w-full p-2 border rounded-md" 
                      placeholder="Please describe your issue in detail..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Submit Ticket</Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default Help;
