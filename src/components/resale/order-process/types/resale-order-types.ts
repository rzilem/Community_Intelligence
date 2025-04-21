
export interface ResaleOrderType {
  id: string;
  title: string;
  basePrice: number;
  description?: string;
  rushOptions: {
    id: string;
    name: string;
    price: number;
    time: string;
  }[];
}

export const orderTypes: Record<string, ResaleOrderType> = {
  'resale-cert': {
    id: 'resale-cert',
    title: 'Resale Certificate',
    basePrice: 275,
    description: 'Standard resale certificate package',
    rushOptions: [
      { id: 'standard', name: 'Standard Processing', price: 0, time: '3-5 business days' },
      { id: 'rush', name: 'Rush Processing', price: 100, time: '1-2 business days' },
      { id: 'super-rush', name: 'Super Rush Processing', price: 200, time: 'Same business day' }
    ]
  }
};
