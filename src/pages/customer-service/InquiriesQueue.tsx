
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { MessageSquare, Search, Filter, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const InquiriesQueue: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const mockInquiries = [
    {
      id: 1,
      subject: 'Pool maintenance issue - urgent',
      sender: 'John Smith',
      email: 'john.smith@email.com',
      status: 'open',
      priority: 'high',
      received: '2024-01-05 09:30',
      category: 'Maintenance',
      excerpt: 'The pool has been cloudy for the past week and chemicals seem off...'
    },
    {
      id: 2,
      subject: 'Assessment payment question',
      sender: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      status: 'pending',
      priority: 'medium',
      received: '2024-01-05 08:15',
      category: 'Billing',
      excerpt: 'I received my monthly assessment but the amount seems different...'
    },
    {
      id: 3,
      subject: 'HOA rules clarification needed',
      sender: 'Mike Davis',
      email: 'mike.davis@email.com',
      status: 'resolved',
      priority: 'low',
      received: '2024-01-04 16:45',
      category: 'General',
      excerpt: 'Could you clarify the pet policy regarding visiting pets...'
    },
    {
      id: 4,
      subject: 'Parking violation dispute',
      sender: 'Lisa Chen',
      email: 'lisa.chen@email.com',
      status: 'open',
      priority: 'medium',
      received: '2024-01-04 14:20',
      category: 'Violations',
      excerpt: 'I received a parking violation notice but I believe it was issued in error...'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 text-red-700';
      case 'medium': return 'border-yellow-200 text-yellow-700';
      case 'low': return 'border-green-200 text-green-700';
      default: return 'border-gray-200 text-gray-700';
    }
  };

  const filteredInquiries = mockInquiries.filter(inquiry => {
    const matchesSearch = searchTerm === '' || 
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeTab === 'all' || inquiry.status === activeTab;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <PageTemplate
      title="Customer Service Inquiries"
      icon={<MessageSquare className="h-8 w-8" />}
      description="Process and respond to customer service inquiries"
    >
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inquiries..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="violations">Violations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Inquiries</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Inquiries ({filteredInquiries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{inquiry.subject}</h3>
                            <Badge className={`${getStatusColor(inquiry.status)} text-white text-xs`}>
                              {inquiry.status}
                            </Badge>
                            <Badge variant="outline" className={`${getPriorityColor(inquiry.priority)} text-xs`}>
                              {inquiry.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            From: <span className="font-medium">{inquiry.sender}</span> ({inquiry.email})
                          </p>
                          
                          <p className="text-sm">{inquiry.excerpt}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Category: {inquiry.category}</span>
                            <span>Received: {inquiry.received}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm">
                          View Full Details
                        </Button>
                        <Button size="sm">
                          Respond
                        </Button>
                        {inquiry.status !== 'resolved' && (
                          <Button variant="outline" size="sm">
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="open" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <p className="text-muted-foreground">
                    {filteredInquiries.filter(i => i.status === 'open').length} open inquiries require immediate attention
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-muted-foreground">
                    {filteredInquiries.filter(i => i.status === 'pending').length} inquiries pending response
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-muted-foreground">
                    {filteredInquiries.filter(i => i.status === 'resolved').length} inquiries resolved
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default InquiriesQueue;
