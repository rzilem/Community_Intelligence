
import { 
  DatabaseProperty, 
  DatabaseResident, 
  FormattedResident, 
  AssociationData,
  PropertyLookup,
  AssociationLookup
} from '../types/resident-types';

export class ResidentFormatterService {
  
  formatResidentsData(
    residents: DatabaseResident[],
    properties: DatabaseProperty[],
    associations: AssociationData[]
  ): FormattedResident[] {
    // Create optimized lookups using Maps for O(1) access
    const associationsLookup = this.createAssociationLookup(associations);
    const propertiesLookup = this.createPropertyLookup(properties);
    
    // Use map for better performance than forEach
    return residents.map(resident => 
      this.formatSingleResident(resident, propertiesLookup, associationsLookup)
    );
  }

  private createAssociationLookup(associations: AssociationData[]): AssociationLookup {
    const lookup: AssociationLookup = {};
    for (const assoc of associations) {
      lookup[assoc.id] = assoc.name;
    }
    return lookup;
  }

  private createPropertyLookup(properties: DatabaseProperty[]): PropertyLookup {
    const lookup: PropertyLookup = {};
    for (const prop of properties) {
      lookup[prop.id] = prop;
    }
    return lookup;
  }

  private formatSingleResident(
    resident: DatabaseResident,
    propertiesLookup: PropertyLookup,
    associationsLookup: AssociationLookup
  ): FormattedResident {
    const property = resident.property_id ? propertiesLookup[resident.property_id] : null;
    const associationId = property?.association_id;
    
    // Map resident_type to the expected type union
    const normalizeType = (type: string): 'owner' | 'tenant' | 'family-member' => {
      const lowerType = type.toLowerCase();
      if (lowerType.includes('owner')) return 'owner';
      if (lowerType.includes('tenant')) return 'tenant';
      if (lowerType.includes('family')) return 'family-member';
      // Default to owner if we can't determine
      return 'owner';
    };
    
    return {
      id: resident.id,
      name: resident.name || 'Unknown',
      email: resident.email || '',
      phone: resident.phone || '',
      propertyAddress: property 
        ? `${property.address}${property.unit_number ? ` Unit ${property.unit_number}` : ''}` 
        : 'Unknown',
      propertyId: resident.property_id || '',
      type: normalizeType(resident.resident_type),
      status: resident.move_out_date ? 'inactive' : 'active',
      moveInDate: resident.move_in_date || new Date().toISOString().split('T')[0],
      moveOutDate: resident.move_out_date,
      association: associationId || '',
      associationName: associationId && associationsLookup[associationId] 
        ? associationsLookup[associationId] 
        : 'Unknown Association',
      lastPayment: null,
      closingDate: null,
      hasValidAssociation: !!(associationId && associationsLookup[associationId])
    };
  }
}

export const residentFormatterService = new ResidentFormatterService();
