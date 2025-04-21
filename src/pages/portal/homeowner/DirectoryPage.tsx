
import React, { useState } from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { Users, Search, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortalNavigation } from '@/components/portal/PortalNavigation';

// Sample directory data
const boardMembers = [
  { id: 1, name: 'John Smith', role: 'President', email: 'john.smith@example.com', phone: '(555) 123-4567' },
  { id: 2, name: 'Sarah Johnson', role: 'Vice President', email: 'sarah.j@example.com', phone: '(555) 234-5678' },
  { id: 3, name: 'Michael Brown', role: 'Treasurer', email: 'mbrown@example.com', phone: '(555) 345-6789' },
  { id: 4, name: 'Elizabeth Davis', role: 'Secretary', email: 'e.davis@example.com', phone: '(555) 456-7890' },
  { id: 5, name: 'Robert Wilson', role: 'Member at Large', email: 'rwilson@example.com', phone: '(555) 567-8901' },
];

const committeeMembers = [
  { id: 1, name: 'David Lee', committee: 'Architectural Review', email: 'dlee@example.com', phone: '(555) 987-6543' },
  { id: 2, name: 'Patricia Miller', committee: 'Landscape', email: 'pmiller@example.com', phone: '(555) 876-5432' },
  { id: 3, name: 'James Wilson', committee: 'Social', email: 'jwilson@example.com', phone: '(555) 765-4321' },
  { id: 4, name: 'Linda Garcia', committee: 'Architectural Review', email: 'lgarcia@example.com', phone: '(555) 654-3210' },
  { id: 5, name: 'Jennifer Rodriguez', committee: 'Social', email: 'jrodriguez@example.com', phone: '(555) 543-2109' },
];

const managementContacts = [
  { id: 1, name: 'Community Intelligence', role: 'Management Company', email: 'contact@communityintelligence.com', phone: '(555) 111-2222' },
  { id: 2, name: 'Alex Thompson', role: 'Community Manager', email: 'athompson@communityintelligence.com', phone: '(555) 222-3333' },
  { id: 3, name: 'Jessica Martinez', role: 'Assistant Manager', email: 'jmartinez@communityintelligence.com', phone: '(555) 333-4444' },
  { id: 4, name: 'Property Maintenance', role: 'Maintenance', email: 'maintenance@communityintelligence.com', phone: '(555) 444-5555' },
];

const DirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('board');
  
  // Filter function based on search term
  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.role && item.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.committee && item.committee.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Filtered data
  const filteredBoardMembers = filterItems(boardMembers);
  const filteredCommitteeMembers = filterItems(committeeMembers);
  const filteredManagementContacts = filterItems(managementContacts);

  return (
    <PortalPageLayout 
      title="Community Directory" 
      icon={<Users className="h-6 w-6" />}
      description="Find contact information for board members, committees, and management staff"
      portalType="homeowner"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="homeowner" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search directory..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="board">Board Members</TabsTrigger>
              <TabsTrigger value="committees">Committees</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="board" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBoardMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No board members found matching your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBoardMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{member.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="text-sm">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span className="text-sm">{member.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`mailto:${member.email}`}>
                                  <Mail className="h-4 w-4 mr-1" />
                                  Email
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="committees" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Committee</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommitteeMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No committee members found matching your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCommitteeMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{member.committee}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="text-sm">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span className="text-sm">{member.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`mailto:${member.email}`}>
                                  <Mail className="h-4 w-4 mr-1" />
                                  Email
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="management" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredManagementContacts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No management contacts found matching your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredManagementContacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{contact.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="text-sm">{contact.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span className="text-sm">{contact.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`mailto:${contact.email}`}>
                                  <Mail className="h-4 w-4 mr-1" />
                                  Email
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default DirectoryPage;
