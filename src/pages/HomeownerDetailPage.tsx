import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  User, Mail, Phone, Calendar, MapPin, Plus, Search, FileText, Image, Home
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/date-utils';
import { useParams } from 'react-router-dom';
import { HomePropertyImage } from '@/components/homeowners/HomePropertyImage';

const mockHomeowner = {
  id: '101',
  name: 'Alice Johnson',
  email: 'alice.j@example.com',
  phone: '(555) 123-4567',
  moveInDate: '2021-03-15',
  property: 'Oakwood Heights',
  unit: 'Unit 301',
  balance: 1250.00,
  tags: ['Board Member', 'New Resident', 'Delinquent'],
  violations: ['Landscaping Violation', 'ARC Pending'],
  lastContact: {
    called: '2023-06-05',
    visit: '2023-05-20',
    email: '2023-06-02'
  },
  status: 'Active',
  notes: [
    {
      type: 'system',
      author: 'System',
      content: 'Late payment notice automatically sent',
      date: '2023-05-16'
    },
    {
      type: 'manual',
      author: 'Jane Smith',
      content: 'Homeowner called about maintenance request for kitchen sink',
      date: '2023-05-02'
    },
    {
      type: 'manual',
      author: 'John Doe',
      content: 'Homeowner mentioned they might renew for another year',
      date: '2023-04-10'
    }
  ]
};

const getTagColor = (tag: string) => {
  const tagColors: Record<string, string> = {
    'Board Member': 'bg-blue-100 text-blue-800 border-blue-200',
    'New Resident': 'bg-purple-100 text-purple-800 border-purple-200',
    'Delinquent': 'bg-red-100 text-red-800 border-red-200',
    'Landscaping Violation': 'bg-orange-100 text-orange-800 border-orange-200',
    'ARC Pending': 'bg-violet-100 text-violet-800 border-violet-200'
  };
  
  return tagColors[tag] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const HomeownerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('Summary');
  const [activeNotesTab, setActiveNotesTab] = useState('Manual Notes');
  
  const homeowner = mockHomeowner;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{homeowner.name}</h1>
              <Badge className="bg-green-100 text-green-800 border border-green-200 rounded-full px-3 py-1 ml-4">
                {homeowner.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {homeowner.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className={`rounded-full px-3 py-1 flex items-center gap-1 ${getTagColor(tag)}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current opacity-70"></span>
                  {tag}
                </Badge>
              ))}
              {homeowner.violations.map(violation => (
                <Badge 
                  key={violation} 
                  variant="outline" 
                  className={`rounded-full px-3 py-1 flex items-center gap-1 ${getTagColor(violation)}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current opacity-70"></span>
                  {violation}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-sm h-7">
                <Plus className="h-4 w-4" /> Add Tag
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  ID: {homeowner.id}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {homeowner.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {homeowner.phone}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Move in: {formatDate(homeowner.moveInDate)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {`${homeowner.property} • ${homeowner.unit}`}
                </div>
              </div>
              <Card className="rounded-lg">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-medium">Account & Contact Info</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center text-sm text-red-500">
                        <span className="h-4 w-4 mr-2 flex items-center justify-center">
                          <span className="h-2.5 w-2.5 rounded-full bg-current"></span>
                        </span>
                        Current Balance
                      </div>
                      <p className="text-red-500 font-semibold ml-6">${homeowner.balance.toFixed(2)}</p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        Last Contact
                      </div>
                      <div className="ml-6 text-sm space-y-1">
                        <p>Called: {homeowner.lastContact.called}</p>
                        <p>Office Visit: {homeowner.lastContact.visit}</p>
                        <p>Email: {homeowner.lastContact.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="ml-6">
            <HomePropertyImage 
              address={`${homeowner.property} ${homeowner.unit}, Austin, TX`}
              propertyId={homeowner.id}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="Summary">Summary</TabsTrigger>
            <TabsTrigger value="Property">Property</TabsTrigger>
            <TabsTrigger value="Financial">Financial</TabsTrigger>
            <TabsTrigger value="Communications">Communications</TabsTrigger>
            <TabsTrigger value="Documents">Documents</TabsTrigger>
            <TabsTrigger value="Notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="Summary">
            <Card>
              <CardContent className="p-6">
                <h2>Homeowner Summary Content</h2>
                <p>Summary information would appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="Property">
            <Card>
              <CardContent className="p-6">
                <h2>Property Information</h2>
                <p>Property details would appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="Financial">
            <Card>
              <CardContent className="p-6">
                <h2>Financial Information</h2>
                <p>Financial details would appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="Communications">
            <Card>
              <CardContent className="p-6">
                <h2>Communications History</h2>
                <p>Communication logs would appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="Documents">
            <Card>
              <CardContent className="p-6">
                <h2>Homeowner Documents</h2>
                <p>Document list would appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="Notes">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Notes</h2>
                    <p className="text-muted-foreground text-sm">Internal notes and activity logs about this homeowner</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search notes..." 
                        className="pl-9 w-[250px]"
                      />
                    </div>
                    <Button className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Add Note
                    </Button>
                  </div>
                </div>

                <div className="border-b mb-6">
                  <div className="flex gap-4">
                    <button
                      className={`pb-2 px-1 font-medium text-sm ${
                        activeNotesTab === 'Manual Notes' 
                          ? 'border-b-2 border-primary' 
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setActiveNotesTab('Manual Notes')}
                    >
                      Manual Notes
                    </button>
                    <button
                      className={`pb-2 px-1 font-medium text-sm ${
                        activeNotesTab === 'Activity Log' 
                          ? 'border-b-2 border-primary' 
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setActiveNotesTab('Activity Log')}
                    >
                      Activity Log
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {homeowner.notes.map((note, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{note.type === 'system' ? 'System' : note.author}</h3>
                        <span className="text-sm text-muted-foreground">{note.date}</span>
                      </div>
                      <p className="mt-2">{note.content}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Activity logs are automatically generated and cannot be modified
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default HomeownerDetailPage;
