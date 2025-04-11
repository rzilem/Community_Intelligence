
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface HomeownerInfoProps {
  id: string;
  email: string;
  phone: string;
  moveInDate: string;
  property: string;
  unit: string;
  balance: number;
  lastContact: {
    called: string;
    visit: string;
    email: string;
  };
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-4 w-4 mr-2" />
          ID: {id}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="h-4 w-4 mr-2" />
          {email}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="h-4 w-4 mr-2" />
          {phone}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          Move in: {formatDate(moveInDate)}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {`${property} • ${unit}`}
        </div>
      </div>
      <Card className="rounded-lg">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-medium">Account & Contact Info</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center text-sm text-red-500">
                <span className="h-4 w-4 mr-2 flex items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-current"></span>
                </span>
                Current Balance
              </div>
              <p className="text-red-500 font-semibold ml-6">${balance.toFixed(2)}</p>
            </div>
            <div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                Last Contact
              </div>
              <div className="ml-6 text-sm space-y-1">
                <p>Called: {lastContact.called}</p>
                <p>Office Visit: {lastContact.visit}</p>
                <p>Email: {lastContact.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
