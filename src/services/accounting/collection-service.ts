// Complete mock implementation to avoid database errors
export class CollectionService {
  static async getCollectionCases(associationId: string): Promise<any[]> {
    return [
      {
        id: '1',
        property_id: 'prop-1',
        total_amount_due: 1500.00,
        status: 'active',
        created_date: new Date().toISOString().split('T')[0]
      }
    ];
  }

  static async createCollectionCase(data: any): Promise<any> {
    return { id: crypto.randomUUID(), ...data };
  }
}