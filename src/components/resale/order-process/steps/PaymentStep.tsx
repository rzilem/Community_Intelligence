
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PaymentStepProps {
  formData: any;
  onInputChange: (section: string, field: string, value: string) => void;
}

export const PaymentStep = ({ formData, onInputChange }: PaymentStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cardName">Name on Card</Label>
        <Input
          id="cardName"
          value={formData.payment.cardName}
          onChange={(e) => onInputChange('payment', 'cardName', e.target.value)}
          placeholder="Enter the name on your card"
        />
      </div>

      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          value={formData.payment.cardNumber}
          onChange={(e) => onInputChange('payment', 'cardNumber', e.target.value)}
          placeholder="Enter your card number"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiration">Expiration Date</Label>
          <Input
            id="expiration"
            value={formData.payment.expiration}
            onChange={(e) => onInputChange('payment', 'expiration', e.target.value)}
            placeholder="MM/YY"
          />
        </div>
        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            value={formData.payment.cvv}
            onChange={(e) => onInputChange('payment', 'cvv', e.target.value)}
            type="password"
            maxLength={4}
            placeholder="Enter CVV"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="billingZip">Billing Zip Code</Label>
        <Input
          id="billingZip"
          value={formData.payment.billingZip}
          onChange={(e) => onInputChange('payment', 'billingZip', e.target.value)}
          placeholder="Enter billing zip code"
        />
      </div>
    </div>
  );
};
