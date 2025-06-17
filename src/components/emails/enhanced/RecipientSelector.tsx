
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Upload, Filter, Search } from 'lucide-react';
import { useLeads } from '@/hooks/leads/useLeads';

interface RecipientSelectorProps {
  selectedRecipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  selectedRecipients,
  onRecipientsChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [manualEmails, setManualEmails] = useState('');
  const { leads = [], isLoading } = useLeads();

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleLeadToggle = (leadEmail: string) => {
    if (selectedRecipients.includes(leadEmail)) {
      onRecipientsChange(selectedRecipients.filter(email => email !== leadEmail));
    } else {
      onRecipientsChange([...selectedRecipients, leadEmail]);
    }
  };

  const handleSelectAll = () => {
    const allEmails = filteredLeads
      .filter(lead => lead.email)
      .map(lead => lead.email!);
    onRecipientsChange([...new Set([...selectedRecipients, ...allEmails])]);
  };

  const handleDeselectAll = () => {
    const filteredEmails = filteredLeads
      .filter(lead => lead.email)
      .map(lead => lead.email!);
    onRecipientsChange(selectedRecipients.filter(email => !filteredEmails.includes(email)));
  };

  const handleManualEmailsAdd = () => {
    const emails = manualEmails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    onRecipientsChange([...new Set([...selectedRecipients, ...emails])]);
    setManualEmails('');
  };

  const removeRecipient = (email: string) => {
    onRecipientsChange(selectedRecipients.filter(e => e !== email));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Recipients ({selectedRecipients.length} selected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="leads">
            <TabsList>
              <TabsTrigger value="leads">From Leads</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="import">Import CSV</TabsTrigger>
            </TabsList>

            <TabsContent value="leads" className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All ({filteredLeads.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto border rounded-md">
                {isLoading ? (
                  <div className="p-4 text-center">Loading leads...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No leads found matching your criteria
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredLeads.map(lead => (
                      lead.email && (
                        <div
                          key={lead.id}
                          className="flex items-center justify-between p-3 border-b hover:bg-muted/50"
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedRecipients.includes(lead.email)}
                              onCheckedChange={() => handleLeadToggle(lead.email!)}
                            />
                            <div>
                              <div className="font-medium">{lead.name}</div>
                              <div className="text-sm text-muted-foreground">{lead.email}</div>
                            </div>
                          </div>
                          <Badge variant="outline">{lead.status}</Badge>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div>
                <Label htmlFor="manual-emails">
                  Enter Email Addresses (one per line or comma-separated)
                </Label>
                <textarea
                  id="manual-emails"
                  className="w-full h-32 p-3 border rounded-md resize-none"
                  placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                  value={manualEmails}
                  onChange={(e) => setManualEmails(e.target.value)}
                />
              </div>
              <Button onClick={handleManualEmailsAdd} disabled={!manualEmails.trim()}>
                Add Emails
              </Button>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <div className="text-lg font-medium mb-2">Upload CSV File</div>
                <div className="text-sm text-muted-foreground mb-4">
                  CSV should contain an 'email' column
                </div>
                <Button variant="outline">
                  Choose File
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedRecipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Recipients ({selectedRecipients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {selectedRecipients.map(email => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeRecipient(email)}
                  >
                    {email} ×
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
