import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from "lucide-react";
import { JournalEntry, GLAccount } from "@/types/accounting-types";
import { formatGLAccount, isJournalEntryBalanced } from "@/utils/accounting-helpers";

interface JournalEntryLineItem {
  id?: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

interface JournalEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  entry?: JournalEntry;
  accounts: GLAccount[];
}

const JournalEntryDialog: React.FC<JournalEntryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  entry,
  accounts,
}) => {
  const [entryNumber, setEntryNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [lineItems, setLineItems] = useState<JournalEntryLineItem[]>([
    { accountId: "", description: "", debit: 0, credit: 0 },
    { accountId: "", description: "", debit: 0, credit: 0 },
  ]);

  useEffect(() => {
    if (entry) {
      setEntryNumber(entry.entryNumber);
      setDate(new Date(entry.entryDate).toISOString().split("T")[0]);
      setDescription(entry.description);

      // If the entry has details, use them
      if (entry.details && entry.details.length > 0) {
        setLineItems(
          entry.details.map((detail) => ({
            id: detail.id,
            accountId: detail.gl_account_id,
            description: detail.description || "",
            debit: detail.debit,
            credit: detail.credit,
          }))
        );
      } else {
        // Create default line items for debit and credit
        const items: JournalEntryLineItem[] = [];
        
        if (entry.debitAccountId) {
          items.push({
            accountId: entry.debitAccountId,
            description: "",
            debit: entry.amount,
            credit: 0,
          });
        }
        
        if (entry.creditAccountId) {
          items.push({
            accountId: entry.creditAccountId,
            description: "",
            debit: 0,
            credit: entry.amount,
          });
        }
        
        if (items.length > 0) {
          setLineItems(items);
        }
      }
    } else {
      // Reset form for new entry
      setEntryNumber("");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setLineItems([
        { accountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", description: "", debit: 0, credit: 0 },
      ]);
    }
  }, [entry]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { accountId: "", description: "", debit: 0, credit: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    const filteredItems = lineItems.filter((_, i) => i !== index);
    setLineItems(filteredItems);
  };

  const handleLineItemChange = (index: number, field: keyof JournalEntryLineItem, value: string | number) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    setLineItems(newLineItems);
  };

  const calculateTotals = () => {
    const totalDebit = lineItems.reduce((sum, item) => sum + Number(item.debit || 0), 0);
    const totalCredit = lineItems.reduce((sum, item) => sum + Number(item.credit || 0), 0);
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = () => {
    if (!isBalanced) {
      alert("Journal entry must be balanced (debits must equal credits)");
      return;
    }

    // Convert line items to the format expected by the backend
    const formattedLineItems = lineItems.map(item => ({
      id: item.id,
      gl_account_id: item.accountId,
      description: item.description,
      debit: Number(item.debit) || 0,
      credit: Number(item.credit) || 0
    }));

    onSubmit({
      entryNumber,
      date,
      description,
      lineItems: formattedLineItems,
      // Other fields as needed
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit" : "Create"} Journal Entry</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="entryNumber">Entry Number</Label>
            <Input
              id="entryNumber"
              value={entryNumber}
              onChange={(e) => setEntryNumber(e.target.value)}
              placeholder="Auto-generated if left blank"
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for this journal entry"
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Line Items</h3>
            <Button type="button" size="sm" onClick={handleAddLineItem}>
              <Plus className="h-4 w-4 mr-1" /> Add Line
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium">Account</th>
                  <th className="text-left py-2 px-4 font-medium">Description</th>
                  <th className="text-right py-2 px-4 font-medium">Debit</th>
                  <th className="text-right py-2 px-4 font-medium">Credit</th>
                  <th className="py-2 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">
                      <Select
                        value={item.accountId}
                        onValueChange={(value) =>
                          handleLineItemChange(index, "accountId", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {formatGLAccount(account)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(index, "description", e.target.value)
                        }
                        placeholder="Description"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        type="number"
                        value={item.debit || ""}
                        onChange={(e) =>
                          handleLineItemChange(index, "debit", parseFloat(e.target.value) || 0)
                        }
                        className="text-right"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        type="number"
                        value={item.credit || ""}
                        onChange={(e) =>
                          handleLineItemChange(index, "credit", parseFloat(e.target.value) || 0)
                        }
                        className="text-right"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-4">
                      {lineItems.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLineItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="font-medium">
                  <td colSpan={2} className="py-2 px-4 text-right">
                    Totals:
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${totalDebit.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${totalCredit.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          {!isBalanced && (
            <div className="text-red-500 text-sm mt-2">
              Journal entry must be balanced (difference: $
              {Math.abs(totalDebit - totalCredit).toFixed(2)})
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isBalanced || lineItems.length === 0}
          >
            {entry ? "Update" : "Create"} Journal Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
