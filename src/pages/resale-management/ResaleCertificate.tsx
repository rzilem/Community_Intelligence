
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { 
  FileText, Search, Filter, Plus, ArrowDownUp, Eye, FileEdit, Download, Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useResaleOrders } from '@/hooks/resale/useResaleOrders';
import { toast } from 'sonner';

const ResaleCertificate = () => {
  const navigate = useNavigate();
  const { orders, isLoading, error, refreshOrders } = useResaleOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Filter for only Certificate types
  const certificates = orders.filter(order => 
    order.type === 'Resale Certificate' && 
    (searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ownerSeller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.community.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handlers for actions
  const handleNewCertificate = () => {
    toast.info('Creating new resale certificate');
    // navigate('/resale-management/certificate/new');
  };

  const handleViewCertificate = (id: string) => {
    toast.info(`Viewing certificate ${id}`);
    // navigate(`/resale-management/certificate/${id}`);
  };

  const handleEditCertificate = (id: string) => {
    toast.info(`Editing certificate ${id}`);
    // navigate(`/resale-management/certificate/${id}/edit`);
  };

  const handleDownloadCertificate = (id: string) => {
    toast.success(`Certificate ${id} prepared for download`);
  };

  const handleRefresh = () => {
    refreshOrders();
    setLastRefreshed(new Date());
    toast.success('Certificates refreshed');
  };

  // Helper function to render status badges
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge className="bg-amber-500">Scheduled</Badge>;
      case 'Completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'In Review':
        return <Badge className="bg-blue-500">In Review</Badge>;
      case 'Past Due':
        return <Badge className="bg-red-500">Past Due</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <PageTemplate 
      title="Resale Certificates" 
      icon={<FileText className="h-8 w-8" />}
      description="Manage and process resale certificates for property transfers"
    >
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Create and manage resale certificates required for property transfers
        </p>
        <Button className="gap-2" onClick={handleNewCertificate}>
          <Plus className="h-4 w-4" /> New Certificate
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search certificates..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleRefresh}>
                <ArrowDownUp className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Loading certificates...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Certificate #</TableHead>
                      <TableHead className="whitespace-nowrap">Property Address</TableHead>
                      <TableHead className="whitespace-nowrap">Owner/Seller</TableHead>
                      <TableHead className="whitespace-nowrap">Association</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Due Date</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.length > 0 ? (
                      certificates.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-medium">{cert.orderNumber}</TableCell>
                          <TableCell className="max-w-xs truncate">{cert.address}</TableCell>
                          <TableCell>{cert.ownerSeller}</TableCell>
                          <TableCell>{cert.community}</TableCell>
                          <TableCell>{renderStatusBadge(cert.status)}</TableCell>
                          <TableCell>{cert.scheduledDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="View"
                                onClick={() => handleViewCertificate(cert.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Edit"
                                onClick={() => handleEditCertificate(cert.id)}
                              >
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Download"
                                onClick={() => handleDownloadCertificate(cert.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No certificates found matching your search criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <div>Showing {certificates.length} certificates</div>
                <div>Last refreshed: {lastRefreshed.toLocaleString()}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default ResaleCertificate;
