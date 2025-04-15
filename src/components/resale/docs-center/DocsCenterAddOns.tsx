
import React, { useState } from 'react';
import { Search, Plus, Book, Map, Package, Boxes } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import TooltipButton from '@/components/ui/tooltip-button';

const DocsCenterAddOns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock add-on products for UI demonstration
  const addOnProducts = [
    { 
      id: '1', 
      name: 'Welcome Book', 
      description: 'Comprehensive guide for new homeowners',
      type: 'book', 
      price: 45.00,
      status: 'Active' 
    },
    { 
      id: '2', 
      name: '3D Community Map', 
      description: 'Interactive 3D map of the community',
      type: '3d-map', 
      price: 65.00,
      status: 'Active' 
    },
    { 
      id: '3', 
      name: 'Community Rules Booklet', 
      description: 'Printed booklet of community rules and regulations',
      type: 'book', 
      price: 25.00,
      status: 'Draft' 
    },
    { 
      id: '4', 
      name: 'HOA Welcome Package', 
      description: 'Complete welcome kit for new residents',
      type: 'package', 
      price: 95.00,
      status: 'Active' 
    }
  ];

  const filteredProducts = addOnProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get the appropriate icon for each product type
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <Book className="h-4 w-4 mr-2 text-blue-500" />;
      case '3d-map':
        return <Boxes className="h-4 w-4 mr-2 text-purple-500" />;
      case 'map':
        return <Map className="h-4 w-4 mr-2 text-green-500" />;
      case 'package':
        return <Package className="h-4 w-4 mr-2 text-amber-500" />;
      default:
        return <Package className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-between">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search add-on products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <TooltipButton tooltip="Create a new add-on product for resale orders">
          <Plus className="mr-2 h-4 w-4" />
          New Add-on Product
        </TooltipButton>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Add-on Products</CardTitle>
          <CardDescription>
            Additional products that can be included in resale orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getProductIcon(product.type)}
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'Active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipButton variant="ghost" size="sm" tooltip="View product details">
                        View
                      </TooltipButton>
                      <TooltipButton variant="ghost" size="sm" tooltip="Edit product">
                        Edit
                      </TooltipButton>
                      <TooltipButton variant="ghost" size="sm" tooltip="Preview product">
                        Preview
                      </TooltipButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No add-on products found.
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

export default DocsCenterAddOns;
