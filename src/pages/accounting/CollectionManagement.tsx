import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, DollarSign, Calendar, FileText } from 'lucide-react';
import { CollectionService } from '@/services/accounting/collection-service';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CollectionManagement: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const associationId = 'demo-association-id';

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await CollectionService.getCollectionCases(associationId);
      setCases(data);
    } catch (error) {
      console.error('Error loading collection cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collection Management</h1>
          <p className="text-muted-foreground">Manage delinquent accounts and collection processes</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Collection Case</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" /><div><p className="text-sm text-muted-foreground">Open Cases</p><p className="text-2xl font-bold">{cases.filter(c => c.case_status === 'open').length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-500" /><div><p className="text-sm text-muted-foreground">Total Owed</p><p className="text-2xl font-bold">{formatCurrency(cases.reduce((sum, c) => sum + (c.current_balance || 0), 0))}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" /><div><p className="text-sm text-muted-foreground">Legal Stage</p><p className="text-2xl font-bold">{cases.filter(c => c.collection_stage === 'legal').length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-purple-500" /><div><p className="text-sm text-muted-foreground">Settled</p><p className="text-2xl font-bold">{cases.filter(c => c.case_status === 'settled').length}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Collection Cases</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading collection cases...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Opened Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No collection cases found.</TableCell></TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">{c.case_number}</TableCell>
                      <TableCell>Property #{c.property_id.slice(-8)}</TableCell>
                      <TableCell>{formatCurrency(c.total_amount_owed || 0)}</TableCell>
                      <TableCell><Badge>{c.case_status}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{c.collection_stage}</Badge></TableCell>
                      <TableCell>{new Date(c.opened_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionManagement;