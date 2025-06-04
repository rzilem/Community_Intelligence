
import { DatabaseProperty, DatabaseResident, FormattedResident, AssociationData } from './types';

export const formatResidentsData = (
  residents: DatabaseResident[],
  properties: DatabaseProperty[],
  associations: AssociationData[]
): FormattedResident[] => {
  // Create association name lookup
  const associationsMap: Record<string, string> = {};
  for (const assoc of associations) {
    associationsMap[assoc.id] = assoc.name;
  }

  // Create properties lookup
  const propertiesMap: Record<string, DatabaseProperty> = {};
  for (const prop of properties) {
    propertiesMap[prop.id] = prop;
  }
  
  // Format the residents data
  const formattedResidents: FormattedResident[] = [];
  
  for (const resident of residents) {
    const property = resident.property_id ? propertiesMap[resident.property_id] : null;
    const associationId = property?.association_id;
    
    const formattedResident: FormattedResident = {
      id: resident.id,
      name: resident.name || 'Unknown',
      email: resident.email || '',
      phone: resident.phone || '',
      propertyAddress: property ? `${property.address}${property.unit_number ? ` Unit ${property.unit_number}` : ''}` : 'Unknown',
      type: resident.resident_type,
      status: resident.move_out_date ? 'inactive' : 'active',
      moveInDate: resident.move_in_date || new Date().toISOString().split('T')[0],
      moveOutDate: resident.move_out_date,
      association: associationId || '',
      associationName: associationId && associationsMap[associationId] ? associationsMap[associationId] : 'Unknown Association',
      lastPayment: null,
      closingDate: null,
      hasValidAssociation: !!associationsMap[associationId || '']
    };
    
    formattedResidents.push(formattedResident);
  }
  
  return formattedResidents;
};
