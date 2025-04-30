
import React from 'react';
import { 
  Clipboard, 
  FileText, 
  ClipboardList, 
  FileCheck, 
  FileBarChart, 
  FileBox, 
  ListOrdered,
  Plus,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock data for the resale certificates
const mockCertificates = [
  {
    id: "cert-1",
    property_address: "123 Main St, Austin, TX 78701",
    requester_name: "John Smith",
    request_date: "2025-03-15",
    due_date: "2025-03-22",
    status: "in_progress",
    total_fee: 300.00
  },
  {
    id: "cert-2",
    property_address: "456 Oak Ave, Austin, TX 78702",
    requester_name: "Sarah Johnson",
    request_date: "2025-03-12",
    due_date: "2025-03-19",
    status: "completed",
    total_fee: 250.00
  },
  {
    id: "cert-3",
    property_address: "789 Pine Ln, Austin, TX 78703",
    requester_name: "Michael Williams",
    request_date: "2025-03-10",
    due_date: "2025-03-17",
    status: "pending",
    total_fee: 275.00
  }
];

const ResaleCertificate = () => {
  // Sample document counts
  const documentCounts = {
    certificates: 12,
    questionnaires: 8,
    inspections: 6,
    statements: 15,
    trecForms: 4,
    orderQueue: 36,
  };

  // Sample performance metrics
  const performanceMetrics = {
    totalTransactions: {
      value: 1284,
      trend: { value: 12.5, isPositive: true }
    },
    revenue: {
      value: 142384,
      trend: { value: 8.2, isPositive: true }
    },
    averageCompletionTime: {
      value: 3.2,
      unit: 'days',
      trend: { value: 0.8, isPositive: false }
    },
    pendingRequests: {
      value: 42,
      trend: { value: 15.3, isPositive: true }
    }
  };

  return (
    <PageTemplate
      title="Resale Management"
      icon={<Clipboard className="h-8 w-8" />}
      description="Process and manage property resale documentation"
    >
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Process and manage property resale documentation</p>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Resale Request
        </Button>
      </div>

      {/* Recent Orders Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Resale Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCertificates.map(cert => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.property_address}</TableCell>
                  <TableCell>{cert.requester_name}</TableCell>
                  <TableCell>{cert.due_date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "capitalize",
                      cert.status === "completed" && "bg-green-50 text-green-700 border-green-200",
                      cert.status === "in_progress" && "bg-amber-50 text-amber-700 border-amber-200",
                      cert.status === "pending" && "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                      {cert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${cert.total_fee.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/resale-management/certificate/${cert.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Resale Documentation Center</h2>
            <p className="text-gray-500">Manage all resale-related documentation and processes</p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-7 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="certificates">
                <FileText className="h-4 w-4 mr-2" />
                Certificates
              </TabsTrigger>
              <TabsTrigger value="questionnaires">
                <ClipboardList className="h-4 w-4 mr-2" />
                Questionnaires
              </TabsTrigger>
              <TabsTrigger value="inspections">
                <FileCheck className="h-4 w-4 mr-2" />
                Inspections
              </TabsTrigger>
              <TabsTrigger value="statements">
                <FileBarChart className="h-4 w-4 mr-2" />
                Statements
              </TabsTrigger>
              <TabsTrigger value="trecForms">
                <FileBox className="h-4 w-4 mr-2" />
                TREC Forms
              </TabsTrigger>
              <TabsTrigger value="orderQueue">
                <ListOrdered className="h-4 w-4 mr-2" />
                Order Queue
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Resale Certificate Document Card */}
            <DocumentCard 
              title="Resale Certificates" 
              count={documentCounts.certificates} 
              description="Generate and manage property resale certificates"
              icon={<FileText className="h-8 w-8 text-blue-500" />}
              linkTo="/resale-management/certificate"
              linkText="View Resale Certificates"
            />
            
            {/* Condo Questionnaires Document Card */}
            <DocumentCard 
              title="Condo Questionnaires" 
              count={documentCounts.questionnaires} 
              description="Complete and track lender questionnaires"
              icon={<ClipboardList className="h-8 w-8 text-purple-500" />}
              linkTo="/resale-management/questionnaire"
              linkText="View Condo Questionnaires"
            />
            
            {/* Property Inspections Document Card */}
            <DocumentCard 
              title="Property Inspections" 
              count={documentCounts.inspections} 
              description="Schedule and document property inspections"
              icon={<FileCheck className="h-8 w-8 text-green-500" />}
              linkTo="/resale-management/inspection"
              linkText="View Property Inspections"
            />
            
            {/* Account Statements Document Card */}
            <DocumentCard 
              title="Account Statements" 
              count={documentCounts.statements} 
              description="Generate account statements for closing"
              icon={<FileBarChart className="h-8 w-8 text-yellow-500" />}
              linkTo="/resale-management/statements"
              linkText="View Account Statements"
            />
            
            {/* TREC Forms Document Card */}
            <DocumentCard 
              title="TREC Forms" 
              count={documentCounts.trecForms} 
              description="Standard Texas Real Estate Commission forms"
              icon={<FileBox className="h-8 w-8 text-red-500" />}
              linkTo="/resale-management/trec-forms"
              linkText="View TREC Forms"
            />
            
            {/* Order Queue Document Card */}
            <DocumentCard 
              title="Order Queue" 
              count={documentCounts.orderQueue} 
              description="View and manage the processing queue"
              icon={<ListOrdered className="h-8 w-8 text-blue-500" />}
              linkTo="/resale-management/order-queue"
              linkText="View Order Queue"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Transactions Stat Card */}
        <StatCard
          title="Total Transactions"
          value={performanceMetrics.totalTransactions.value.toLocaleString()}
          icon={Users}
          trend={performanceMetrics.totalTransactions.trend}
        />
        
        {/* Revenue Stat Card */}
        <StatCard
          title="Revenue"
          value={`$${performanceMetrics.revenue.value.toLocaleString()}`}
          icon={DollarSign}
          trend={performanceMetrics.revenue.trend}
        />
        
        {/* Average Completion Time Stat Card */}
        <StatCard
          title="Average Completion Time"
          value={`${performanceMetrics.averageCompletionTime.value} ${performanceMetrics.averageCompletionTime.unit}`}
          icon={Clock}
          trend={performanceMetrics.averageCompletionTime.trend}
        />
        
        {/* Pending Requests Stat Card */}
        <StatCard
          title="Pending Requests"
          value={performanceMetrics.pendingRequests.value.toString()}
          icon={AlertTriangle}
          trend={performanceMetrics.pendingRequests.trend}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Performance Metrics</h2>
            <p className="text-gray-500">Track resale document processing performance over time</p>
          </div>

          <div className="flex justify-end mb-4">
            <Tabs defaultValue="monthly">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-gray-50 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Transactions by Document Type Chart</p>
            </div>
            <div className="h-80 bg-gray-50 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Revenue & Remittance Chart</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

// DocumentCard Component
interface DocumentCardProps {
  title: string;
  count: number;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  linkText: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  count,
  description,
  icon,
  linkTo,
  linkText
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            {icon}
            <h3 className="text-lg font-bold mt-2">{title}</h3>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
          <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center font-bold">
            {count}
          </div>
        </div>
        <Link 
          to={linkTo} 
          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
        >
          {linkText}
        </Link>
      </CardContent>
    </Card>
  );
};

export default ResaleCertificate;
