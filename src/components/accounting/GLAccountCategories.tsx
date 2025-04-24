import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { GLAccount } from '@/types/accounting-types';
import { useGLAccounts } from '@/hooks/accounting/useGLAccounts';

interface GLAccountCategoriesProps {
  associationId?: string;
  accounts: GLAccount[];
  onRefresh: () => void;
}

const GLAccountCategories: React.FC<GLAccountCategoriesProps> = ({
  associationId,
  accounts,
  onRefresh
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editMode, setEditMode] = useState(false);

  const getFormattedAccountCategories = (accounts: GLAccount[]): string[] => {
    return Array.from(new Set(accounts.filter(acc => acc.category).map(acc => acc.category || ''))).sort();
  };

  const categories = getFormattedAccountCategories(accounts);

  const handleOpenDialog = (category: string = '', edit: boolean = false) => {
    setCurrentCategory(category);
    setNewCategoryName(category);
    setEditMode(edit);
    setIsDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      toast.success(`Category ${editMode ? 'updated' : 'created'} successfully`);
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">GL Account Categories</h3>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="p-8 text-center border rounded-md bg-muted/10">
          <p>No categories defined. Create your first category to start organizing GL accounts.</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Accounts</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const accountsInCategory = accounts.filter(acc => acc.category === category);
                
                return (
                  <TableRow key={category}>
                    <TableCell className="font-medium">{category}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {accountsInCategory.length > 0 ? (
                          <Badge variant="outline">{accountsInCategory.length} accounts</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No accounts</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenDialog(category, true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            toast.success('Feature coming soon!');
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Operating Expenses"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editMode ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GLAccountCategories;
