
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle } from 'lucide-react';

const RolePermissionsTable: React.FC = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Access Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <div className="font-medium">Administrator</div>
          </TableCell>
          <TableCell>Full access to all features, including system settings</TableCell>
          <TableCell>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Unrestricted</span>
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="font-medium">Manager</div>
          </TableCell>
          <TableCell>Access to most features except system configuration</TableCell>
          <TableCell>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span>High</span>
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="font-medium">Resident</div>
          </TableCell>
          <TableCell>Access to community information and resident features</TableCell>
          <TableCell>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
              <span>Medium</span>
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="font-medium">Maintenance</div>
          </TableCell>
          <TableCell>Access to maintenance requests and schedules</TableCell>
          <TableCell>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
              <span>Medium</span>
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="font-medium">Accountant</div>
          </TableCell>
          <TableCell>Access to financial information and reports</TableCell>
          <TableCell>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
              <span>Medium</span>
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <div className="font-medium">Basic User</div>
          </TableCell>
          <TableCell>Limited access to basic features only</TableCell>
          <TableCell>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
              <span>Low</span>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default RolePermissionsTable;
