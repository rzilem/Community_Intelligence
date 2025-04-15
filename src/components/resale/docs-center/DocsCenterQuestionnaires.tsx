
import React, { useState } from 'react';
import { Search, Plus, FileText, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import TooltipButton from '@/components/ui/tooltip-button';

const DocsCenterQuestionnaires = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bankFilter, setBankFilter] = useState('all');
  
  // Mock questionnaires for UI demonstration
  const questionnaires = [
    { id: '1', name: 'Fannie Mae Form 1076', bank: 'Fannie Mae', lastUpdated: '2023-04-10', status: 'Active' },
    { id: '2', name: 'FHA Condo Questionnaire', bank: 'FHA', lastUpdated: '2023-03-22', status: 'Active' },
    { id: '3', name: 'Chase Bank Standard Form', bank: 'Chase', lastUpdated: '2023-02-15', status: 'Archive' },
    { id: '4', name: 'Wells Fargo Condo Cert', bank: 'Wells Fargo', lastUpdated: '2023-01-30', status: 'Active' }
  ];

  const filteredQuestionnaires = questionnaires.filter(q => 
    q.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (bankFilter === 'all' || q.bank === bankFilter)
  );

  const bankOptions = ['Fannie Mae', 'FHA', 'Chase', 'Wells Fargo', 'Bank of America', 'Custom'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-between">
        <div className="flex flex-grow gap-2 max-w-md">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questionnaires..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={bankFilter} onValueChange={setBankFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Banks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Banks</SelectItem>
              {bankOptions.map(bank => (
                <SelectItem key={bank} value={bank}>{bank}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <TooltipButton variant="outline" tooltip="Download a questionnaire template">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </TooltipButton>
          <TooltipButton tooltip="Create a new lender questionnaire">
            <Plus className="mr-2 h-4 w-4" />
            New Questionnaire
          </TooltipButton>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Condo Questionnaires</CardTitle>
          <CardDescription>
            Lender questionnaires for condominium certification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Questionnaire Name</TableHead>
                <TableHead>Bank/Lender</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestionnaires.length > 0 ? (
                filteredQuestionnaires.map(questionnaire => (
                  <TableRow key={questionnaire.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        {questionnaire.name}
                      </div>
                    </TableCell>
                    <TableCell>{questionnaire.bank}</TableCell>
                    <TableCell>{questionnaire.lastUpdated}</TableCell>
                    <TableCell>
                      <Badge variant={questionnaire.status === 'Active' ? 'default' : 'secondary'}>
                        {questionnaire.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipButton variant="ghost" size="sm" tooltip="View questionnaire details">
                        View
                      </TooltipButton>
                      <TooltipButton variant="ghost" size="sm" tooltip="Edit questionnaire">
                        Edit
                      </TooltipButton>
                      <TooltipButton variant="ghost" size="sm" tooltip="Download questionnaire">
                        Download
                      </TooltipButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No questionnaires found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocsCenterQuestionnaires;
