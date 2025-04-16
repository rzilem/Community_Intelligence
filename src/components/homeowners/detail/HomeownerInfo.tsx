
import React from 'react';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/utils';

interface HomeownerInfoProps {
  id?: string;
  email?: string;
  phone?: string;
  moveInDate?: string;
  property?: string;
  unit?: string;
  balance?: number;
  lastContact?: string;
}

export const HomeownerInfo: React.FC<HomeownerInfoProps> = ({
  id,
  email,
  phone,
  moveInDate,
  property,
  unit,
  balance,
  lastContact
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
        <div className="space-y-2">
          <div className="flex">
            <span className="text-gray-500 w-32">Email:</span>
            <span>{email || 'Not provided'}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-32">Phone:</span>
            <span>{phone || 'Not provided'}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Residency</h3>
        <div className="space-y-2">
          <div className="flex">
            <span className="text-gray-500 w-32">Property:</span>
            <span>{property || 'Not assigned'}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-32">Unit:</span>
            <span>{unit || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-32">Move-in Date:</span>
            <span>{moveInDate ? formatDate(moveInDate) : 'Not recorded'}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Financial</h3>
        <div className="space-y-2">
          <div className="flex">
            <span className="text-gray-500 w-32">Current Balance:</span>
            <span className={balance && balance > 0 ? 'text-red-600 font-medium' : ''}>
              {balance !== undefined ? formatCurrency(balance) : 'Not available'}
            </span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Communication</h3>
        <div className="space-y-2">
          <div className="flex">
            <span className="text-gray-500 w-32">Last Contact:</span>
            <span>{lastContact ? formatDate(lastContact) : 'No recent contact'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
