
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { vendorContractService } from "@/services/vendor-contract-service";
import { Plus, FileText, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import ContractDialog from "./ContractDialog";

interface VendorContractsTabProps {
  vendorId: string;
}

const VendorContractsTab: React.FC<VendorContractsTabProps> = ({ vendorId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['vendor-contracts', vendorId],
    queryFn: () => vendorContractService.getVendorContracts(vendorId),
  });

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800',
      renewed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading contracts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contracts</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No contracts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{contract.contract_type}</CardTitle>
                    <p className="text-sm text-gray-600">#{contract.contract_number}</p>
                  </div>
                  <Badge className={getStatusColor(contract.status)}>
                    {contract.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-gray-600">{format(new Date(contract.start_date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-gray-600">{format(new Date(contract.end_date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  {contract.contract_value && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">Value</p>
                        <p className="text-gray-600">${contract.contract_value.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-gray-600">{contract.contract_type}</p>
                  </div>
                </div>
                {/* Auto-renewal info would be displayed here if supported */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ContractDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        vendorId={vendorId}
        contract={editingContract}
      />
    </div>
  );
};

export default VendorContractsTab;
