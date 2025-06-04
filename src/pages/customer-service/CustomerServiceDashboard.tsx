
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { HeadphonesIcon, MessageSquare, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const CustomerServiceDashboard: React.FC = () => {
  const navigate = useNavigate();

  const mockInquiries = [
    {
      id: 1,
      subject: 'Pool maintenance issue',
      sender: 'John Smith',
      email: 'john.smith@email.com',
      status: 'open',
      priority: 'high',
      received: '2024-01-05 09:30',
      category: 'Maintenance'
    },
    {
      id: 2,
      subject: 'Assessment payment question',
      sender: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      status: 'pending',
      priority: 'medium',
      received: '2024-01-05 08:15',
      category: 'Billing'
    },
    {
      id: 3,
      subject: 'HOA rules clarification',
      sender: 'Mike Davis',
      email: 'mike.davis@email.com',
      status: 'resolved',
      priority: 'low',
      received: '2024-01-04 16:45',
      category: 'General'
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

  return (
    <PageTemplate
      title="Customer Service Dashboard"
      icon={<HeadphonesIcon className="h-8 w-8" />}
      description="Manage customer inquiries and support requests"
      actions={
        <Button onClick={() => navigate('/customer-service/inquiries')}>
          <MessageSquare className="h-4 w-4 mr-2" />
          View All Inquiries
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Inquiries</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Response</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">+3 from yesterday</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">Within SLA</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{inquiry.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        From: {inquiry.sender} ({inquiry.email})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Received: {inquiry.received}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getStatusColor(inquiry.status)} text-white`}>
                        {inquiry.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(inquiry.priority)}>
                        {inquiry.priority} priority
                      </Badge>
                      <Badge variant="secondary">{inquiry.category}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Respond
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default CustomerServiceDashboard;
