import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { 
  User, Building, Mail, Phone, Calendar, CreditCard, 
  FileText, Key, Home, MapPin, History, Camera, 
  DollarSign, AlertTriangle, Shield, Clock
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ResidentWithProfile } from '@/types/app-types';
import { useSupabaseQuery } from '@/hooks/supabase';

// Mock data for the profile page sections
const mockFinancialHistory = [
  { id: 'TRX-001', date: '2023-01-15', type: 'Assessment', amount: 250, status: 'paid' },
  { id: 'TRX-002', date: '2023-02-15', type: 'Assessment', amount: 250, status: 'paid' },
  { id: 'TRX-003', date: '2023-03-15', type: 'Late Fee', amount: 25, status: 'paid' },
  { id: 'TRX-004', date: '2023-04-15', type: 'Assessment', amount: 250, status: 'unpaid' },
  { id: 'TRX-005', date: '2023-05-15', type: 'Assessment', amount: 250, status: 'unpaid' },
];

const mockComplianceHistory = [
  { id: 'VIO-001', date: '2023-02-10', type: 'Lawn Maintenance', status: 'resolved', description: 'Grass exceeding height limit' },
  { id: 'VIO-002', date: '2023-03-22', type: 'Unauthorized Modification', status: 'pending', description: 'Fence installed without approval' },
  { id: 'VIO-003', date: '2023-05-05', type: 'Trash Bins', status: 'active', description: 'Bins left out past collection day' },
];

const mockAppraisalInfo = {
  appraisalValue: 425000,
  taxYear: 2023,
  landValue: 120000,
  improvementValue: 305000,
  taxRate: 0.0219,
  annualTaxes: 9307.50,
  lastAppraisalDate: '2023-01-01',
  appraisalDistrict: 'County Central Appraisal District'
};

const ResidentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch resident data
  const { data: resident, isLoading, error } = useSupabaseQuery<ResidentWithProfile>(
    'residents',
    {
      select: `
        *,
        user:user_id (
          profile:profiles (*)
        )
      `,
      filter: [{ column: 'id', value: id }],
      single: true
    },
    !!id
  );

  // Mock data for property information
  const mockPropertyData = {
    id: 'PROP-101',
    address: '123 Oak Lane',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    type: 'Single Family Home',
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1850,
    yearBuilt: 2005,
    amenities: ['Pool', 'Garage', 'Fireplace'],
    association: 'Oakridge Estates'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">Loading resident profile...</div>
      </AppLayout>
    );
  }

  if (error || !resident) {
    return (
      <AppLayout>
        <div className="p-6">Error loading resident profile. Please try again.</div>
      </AppLayout>
    );
  }

  const displayName = resident.name || 
    (resident.user?.profile && `${resident.user.profile.first_name || ''} ${resident.user.profile.last_name || ''}`.trim()) ||
    'Unknown Resident';
    
  const email = resident.email || resident.user?.profile?.email || '';
  const phone = resident.phone || resident.user?.profile?.phone_number || '';
  const profileImage = resident.user?.profile?.profile_image_url || '';
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profileImage} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={resident.is_primary ? "default" : "outline"}>
                  {resident.is_primary ? 'Primary' : 'Secondary'} Resident
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {resident.resident_type || 'Resident'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" /> Contact
            </Button>
            <Button variant="outline">
              <Key className="mr-2 h-4 w-4" /> Impersonate
            </Button>
            <Button>
              <User className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="appraisal">Appraisal</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" /> Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="col-span-2">{email || 'Not provided'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="col-span-2">{phone || 'Not provided'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Emergency:</span>
                    <span className="col-span-2">{resident.emergency_contact || 'Not provided'}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">Update</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" /> Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="col-span-2">{mockPropertyData.address}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Property ID:</span>
                    <span className="col-span-2">{mockPropertyData.id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="col-span-2">{mockPropertyData.type}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">View Details</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" /> Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="col-span-2 font-semibold text-red-500">$500.00</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Last Payment:</span>
                    <span className="col-span-2">$250.00 on 03/15/2023</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Next Due:</span>
                    <span className="col-span-2">$250.00 on 06/15/2023</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">View Transactions</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" /> Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Badge variant="destructive">1 Open Violation</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Latest:</span>
                    <span className="col-span-2">Trash Bins (05/05/2023)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="col-span-2">Notice Sent</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">View All</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" /> Residency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Move In:</span>
                    <span className="col-span-2">{resident.move_in_date ? new Date(resident.move_in_date).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Move Out:</span>
                    <span className="col-span-2">{resident.move_out_date ? new Date(resident.move_out_date).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="col-span-2">
                      {resident.move_in_date ? 
                        `${Math.floor((new Date().getTime() - new Date(resident.move_in_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months` : 
                        'Unknown'}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">Update</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" /> Account Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Portal Status:</span>
                    <span className="col-span-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Last Login:</span>
                    <span className="col-span-2">May 10, 2023 at 3:45 PM</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">2FA Status:</span>
                    <span className="col-span-2">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Not Enabled</Badge>
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">Manage Access</Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions and updates for this resident</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-muted rounded-full p-2">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Overdue Notice Sent</p>
                      <p className="text-sm text-muted-foreground">May 16, 2023 · Automated System</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-muted rounded-full p-2">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Compliance Violation Recorded</p>
                      <p className="text-sm text-muted-foreground">May 5, 2023 · John Manager</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-muted rounded-full p-2">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Email Communication</p>
                      <p className="text-sm text-muted-foreground">April 28, 2023 · Jane Admin</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Activity</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Current balance and assessment information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-3xl font-bold text-red-500">$500.00</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Regular Assessment</p>
                    <p className="text-3xl font-bold">$250.00</p>
                    <p className="text-xs text-muted-foreground">Due Monthly</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Next Due Date</p>
                    <p className="text-3xl font-bold">06/15/2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All financial transactions for this resident</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Transaction ID</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-right font-medium">Amount</th>
                        <th className="py-3 px-4 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFinancialHistory.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-muted/20">
                          <td className="py-3 px-4 font-medium">{transaction.id}</td>
                          <td className="py-3 px-4">{new Date(transaction.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{transaction.type}</td>
                          <td className="py-3 px-4 text-right">${transaction.amount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={transaction.status === 'paid' ? "outline" : "destructive"} className={transaction.status === 'paid' ? "bg-green-50 text-green-700 border-green-200" : ""}>
                              {transaction.status === 'paid' ? 'Paid' : 'Unpaid'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Stored payment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center">
                        <CreditCard className="h-8 w-8 mr-4" />
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 05/2025</p>
                        </div>
                      </div>
                      <Badge>Default</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center">
                        <Building className="h-8 w-8 mr-4" />
                        <div>
                          <p className="font-medium">Bank Account (ACH)</p>
                          <p className="text-sm text-muted-foreground">First National ****6789</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Add Payment Method</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Configure recurring payments and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">AutoPay:</span>
                    <span className="col-span-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Payment Day:</span>
                    <span className="col-span-2">1st of month</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="col-span-2">Visa ending in 4242</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Email Receipts:</span>
                    <span className="col-span-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Edit Settings</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Property Tab */}
          <TabsContent value="property" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Property Information</CardTitle>
                    <CardDescription>{mockPropertyData.address}, {mockPropertyData.city}, {mockPropertyData.state} {mockPropertyData.zip}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-md text-center">
                        <Home className="h-6 w-6 mx-auto mb-1" />
                        <p className="text-sm text-muted-foreground">Property Type</p>
                        <p className="font-medium">{mockPropertyData.type}</p>
                      </div>
                      <div className="p-4 border rounded-md text-center">
                        <MapPin className="h-6 w-6 mx-auto mb-1" />
                        <p className="text-sm text-muted-foreground">HOA</p>
                        <p className="font-medium">{mockPropertyData.association}</p>
                      </div>
                      <div className="p-4 border rounded-md text-center">
                        <Building className="h-6 w-6 mx-auto mb-1" />
                        <p className="text-sm text-muted-foreground">Square Footage</p>
                        <p className="font-medium">{mockPropertyData.squareFeet} sq ft</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium">Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Property ID:</span>
                            <span>{mockPropertyData.id}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Year Built:</span>
                            <span>{mockPropertyData.yearBuilt}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Bedrooms:</span>
                            <span>{mockPropertyData.bedrooms}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Bathrooms:</span>
                            <span>{mockPropertyData.bathrooms}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">City:</span>
                            <span>{mockPropertyData.city}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">State/Zip:</span>
                            <span>{mockPropertyData.state}, {mockPropertyData.zip}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="mb-2 font-medium">Amenities & Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {mockPropertyData.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary">{amenity}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Property Photos</CardTitle>
                    <CardDescription>Images of the residence and property</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <Camera className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                        <Camera className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                        <Camera className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                        <Camera className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Camera className="mr-2 h-4 w-4" /> Upload Photos
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
                <CardDescription>Service requests and property maintenance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-left font-medium">Description</th>
                        <th className="py-3 px-4 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">REQ-001</td>
                        <td className="py-3 px-4">04/10/2023</td>
                        <td className="py-3 px-4">Plumbing</td>
                        <td className="py-3 px-4">Leaking faucet in master bathroom</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">REQ-002</td>
                        <td className="py-3 px-4">02/22/2023</td>
                        <td className="py-3 px-4">HVAC</td>
                        <td className="py-3 px-4">Annual AC maintenance</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">REQ-003</td>
                        <td className="py-3 px-4">05/15/2023</td>
                        <td className="py-3 px-4">Electrical</td>
                        <td className="py-3 px-4">Kitchen outlet not working</td>
                        <td className="py-3 px-4 text-center">
                          <Badge>In Progress</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Create Maintenance Request</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Summary</CardTitle>
                <CardDescription>Overview of HOA compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Current Violations</p>
                    <p className="text-3xl font-bold text-amber-500">1</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-3xl font-bold text-green-500">2</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Fines</p>
                    <p className="text-3xl font-bold">$0.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Violation History</CardTitle>
                <CardDescription>Record of compliance issues and violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-left font-medium">Description</th>
                        <th className="py-3 px-4 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockComplianceHistory.map((violation) => (
                        <tr key={violation.id} className="border-b hover:bg-muted/20">
                          <td className="py-3 px-4 font-medium">{violation.id}</td>
                          <td className="py-3 px-4">{new Date(violation.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{violation.type}</td>
                          <td className="py-3 px-4">{violation.description}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge 
                              variant={violation.status === 'resolved' ? "outline" : (violation.status === 'active' ? "destructive" : "secondary")}
                              className={violation.status === 'resolved' ? "bg-green-50 text-green-700 border-green-200" : ""}
                            >
                              {violation.status === 'resolved' ? 'Resolved' : 
                               violation.status === 'active' ? 'Active' : 'Pending'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Architectural Requests</CardTitle>
                <CardDescription>ARC requests and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">ID</th>
                        <th className="py-3 px-4 text-left font-medium">Submission Date</th>
                        <th className="py-3 px-4 text-left font-medium">Project</th>
                        <th className="py-3 px-4 text-left font-medium">Review Date</th>
                        <th className="py-3 px-4 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">ARC-001</td>
                        <td className="py-3 px-4">01/15/2023</td>
                        <td className="py-3 px-4">Fence Installation</td>
                        <td className="py-3 px-4">01/30/2023</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">ARC-002</td>
                        <td className="py-3 px-4">04/05/2023</td>
                        <td className="py-3 px-4">Solar Panel Installation</td>
                        <td className="py-3 px-4">--</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="secondary">Under Review</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Submit New Request</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Documents & Forms</CardTitle>
                  <CardDescription>Resident-related documents and forms</CardDescription>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Size</th>
                        <th className="py-3 px-4 text-center font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">Lease Agreement</td>
                        <td className="py-3 px-4">PDF</td>
                        <td className="py-3 px-4">06/14/2022</td>
                        <td className="py-3 px-4">1.2 MB</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Download</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">HOA Rules & Regulations</td>
                        <td className="py-3 px-4">PDF</td>
                        <td className="py-3 px-4">01/01/2023</td>
                        <td className="py-3 px-4">3.5 MB</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Download</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">Property Inspection Report</td>
                        <td className="py-3 px-4">PDF</td>
                        <td className="py-3 px-4">03/15/2023</td>
                        <td className="py-3 px-4">2.1 MB</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Download</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">Insurance Certificate</td>
                        <td className="py-3 px-4">PDF</td>
                        <td className="py-3 px-4">02/28/2023</td>
                        <td className="py-3 px-4">0.8 MB</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Download</Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Activity Log</CardTitle>
                <CardDescription>History of actions and updates to this resident account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h4 className="mb-4 text-sm font-medium text-muted-foreground">Today</h4>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="bg-muted rounded-full p-2">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Profile viewed by Admin</p>
                          <p className="text-sm text-muted-foreground">Today at 10:24 AM · System</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="mb-4 text-sm font-medium text-muted-foreground">Yesterday</h4>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="bg-muted rounded-full p-2">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Payment Reminder Email Sent</p>
                          <p className="text-sm text-muted-foreground">Yesterday at 9:00 AM · Automated System</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-muted rounded-full p-2">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Compliance Violation Recorded</p>
                          <p className="text-sm text-muted-foreground">Yesterday at 3:15 PM · John Manager</p>
                          <p className="text-sm mt-1 pl-4 border-l-2 border-muted">
                            Trash bins left out past collection day
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="mb-4 text-sm font-medium text-muted-foreground">Previous 7 Days</h4>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="bg-muted rounded-full p-2">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Email Communication</p>
                          <p className="text-sm text-muted-foreground">May 12, 2023 at 2:30 PM · Jane Admin</p>
                          <p className="text-sm mt-1 pl-4 border-l-2 border-muted">
                            Regarding upcoming community event
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-muted rounded-full p-2">
                          <Key className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Portal Login</p>
                          <p className="text-sm text-muted-foreground">May 10, 2023 at 3:45 PM · Resident</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-muted rounded-full p-2">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Document Uploaded</p>
                          <p className="text-sm text-muted-foreground">May 8, 2023 at 11:20 AM · Jane Admin</p>
                          <p className="text-sm mt-1 pl-4 border-l-2 border-muted">
                            Insurance Certificate added to resident file
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Load More Activity</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Appraisal Tab */}
          <TabsContent value="appraisal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Appraisal Information</CardTitle>
                <CardDescription>Data from {mockAppraisalInfo.appraisalDistrict}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-3xl font-bold">${mockAppraisalInfo.appraisalValue.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Land Value</p>
                    <p className="text-3xl font-bold">${mockAppraisalInfo.landValue.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Improvement Value</p>
                    <p className="text-3xl font-bold">${mockAppraisalInfo.improvementValue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="mb-3 font-medium">Tax Information</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 border rounded-md">
                          <p className="text-muted-foreground">Tax Year</p>
                          <p className="font-medium">{mockAppraisalInfo.taxYear}</p>
                        </div>
                        <div className="p-3 border rounded-md">
                          <p className="text-muted-foreground">Tax Rate</p>
                          <p className="font-medium">{(mockAppraisalInfo.taxRate * 100).toFixed(2)}%</p>
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <p className="text-muted-foreground">Annual Property Taxes</p>
                        <p className="font-medium">${mockAppraisalInfo.annualTaxes.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="mb-3 font-medium">Appraisal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Last Appraisal:</span>
                        <span>{new Date(mockAppraisalInfo.lastAppraisalDate).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Appraisal District:</span>
                        <span>{mockAppraisalInfo.appraisalDistrict}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Open Appraisal District Website</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Value History</CardTitle>
                <CardDescription>Historical property valuations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Year</th>
                        <th className="py-3 px-4 text-right font-medium">Total Value</th>
                        <th className="py-3 px-4 text-right font-medium">Land Value</th>
                        <th className="py-3 px-4 text-right font-medium">Improvement Value</th>
                        <th className="py-3 px-4 text-right font-medium">Change (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">2023</td>
                        <td className="py-3 px-4 text-right">$425,000</td>
                        <td className="py-3 px-4 text-right">$120,000</td>
                        <td className="py-3 px-4 text-right">$305,000</td>
                        <td className="py-3 px-4 text-right text-green-600">+5.2%</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">2022</td>
                        <td className="py-3 px-4 text-right">$404,000</td>
                        <td className="py-3 px-4 text-right">$115,000</td>
                        <td className="py-3 px-4 text-right">$289,000</td>
                        <td className="py-3 px-4 text-right text-green-600">+8.6%</td>
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">2021</td>
                        <td className="py-3 px-4 text-right">$372,000</td>
                        <td className="py-3 px-4 text-right">$110,000</td>
                        <td className="py-3 px-4 text-right">$262,000</td>
                        <td className="py-3 px-4 text-right text-green-600">+4.5%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ResidentProfile;
