
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Home, Building, User, Calendar, Clock, CreditCard } from 'lucide-react';

interface ResaleOrderSummaryProps {
  orderType: any;
  formData: any;
}

export const ResaleOrderSummary = ({ orderType, formData }: ResaleOrderSummaryProps) => {
  const selectedRushOption = orderType.rushOptions.find((option: any) => 
    option.id === formData.orderDetails.rushOption
  );
  
  const totalPrice = orderType.basePrice + (selectedRushOption?.price || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>Review your order details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">{orderType.title}</span>
            <span>${orderType.basePrice.toFixed(2)}</span>
          </div>
          
          {selectedRushOption && selectedRushOption.price > 0 && (
            <div className="flex justify-between text-sm">
              <span>{selectedRushOption.name} Processing</span>
              <span>+${selectedRushOption.price.toFixed(2)}</span>
            </div>
          )}
          
          <Separator className="my-2" />
          
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="pt-4">
          <h3 className="font-medium mb-2">Document Information</h3>
          <div className="text-sm space-y-2">
            {formData.propertyInfo.address && (
              <div className="flex items-start gap-2">
                <Home className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>
                  {formData.propertyInfo.address}
                  {formData.propertyInfo.unit && `, Unit ${formData.propertyInfo.unit}`}
                  {formData.propertyInfo.city && `, ${formData.propertyInfo.city}`}
                  {formData.propertyInfo.state && `, ${formData.propertyInfo.state}`}
                  {formData.propertyInfo.zip && ` ${formData.propertyInfo.zip}`}
                </span>
              </div>
            )}
            
            {formData.propertyInfo.community && (
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>{formData.propertyInfo.community}</span>
              </div>
            )}
            
            {formData.contactInfo.name && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>{formData.contactInfo.name}</span>
              </div>
            )}
            
            {formData.orderDetails.closingDate && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>Closing Date: {formData.orderDetails.closingDate}</span>
              </div>
            )}
            
            {selectedRushOption && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>{selectedRushOption.name}: {selectedRushOption.time}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-md mt-4">
          <h3 className="font-medium flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4" />
            Secure Payment
          </h3>
          <p className="text-sm">All transactions are secure and encrypted. Your credit card information is never stored on our servers.</p>
        </div>
      </CardContent>
    </Card>
  );
};
