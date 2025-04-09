
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface AssociationFormData {
  name: string;
  type: string;
  units: number;
  city: string;
  state: string;
  address: string;
  zipCode: string;
  phone: string;
  email: string;
}

interface AssociationFormProps {
  onClose: () => void;
  onSave: (data: AssociationFormData) => void;
  isSubmitting: boolean;
}

const AssociationForm: React.FC<AssociationFormProps> = ({ onClose, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState<AssociationFormData>({
    name: '',
    type: 'HOA',
    units: 0,
    city: '',
    state: '',
    address: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, type: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Association Name</label>
          <Input 
            id="name" 
            placeholder="Enter association name" 
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
          <select 
            id="type" 
            className="w-full p-2 border rounded-md"
            value={formData.type}
            onChange={handleSelectChange}
          >
            <option value="HOA">Homeowners Association</option>
            <option value="Condo">Condominium</option>
            <option value="Apartment">Apartment Complex</option>
            <option value="Commercial">Commercial</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="units" className="block text-sm font-medium mb-1">Total Units</label>
          <Input 
            id="units" 
            type="number" 
            placeholder="0" 
            value={formData.units || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
          <Input 
            id="city" 
            placeholder="Enter city" 
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
          <Input 
            id="state" 
            placeholder="Enter state" 
            value={formData.state}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">Address</label>
        <Input 
          id="address" 
          placeholder="Enter street address" 
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-1">ZIP Code</label>
          <Input 
            id="zipCode" 
            placeholder="Enter ZIP code" 
            value={formData.zipCode}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
          <Input 
            id="phone" 
            placeholder="Enter phone number" 
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Enter contact email" 
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Association'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export { type AssociationFormData };
export default AssociationForm;
