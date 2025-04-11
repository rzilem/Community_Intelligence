
import { ResidentType, Resident, ResidentWithProfile } from '@/types/app-types';

// Helper function to convert string to ResidentType
export const toResidentType = (typeString: string): ResidentType => {
  const validTypes: ResidentType[] = ['owner', 'tenant', 'family', 'other'];
  return validTypes.includes(typeString as ResidentType) 
    ? (typeString as ResidentType) 
    : 'other';
};

// Maps raw database residents to typed Resident objects
export const mapDbToResident = (dbResident: any): Resident => {
  return {
    id: dbResident.id,
    user_id: dbResident.user_id,
    property_id: dbResident.property_id,
    resident_type: toResidentType(dbResident.resident_type),
    is_primary: dbResident.is_primary,
    move_in_date: dbResident.move_in_date,
    move_out_date: dbResident.move_out_date,
    name: dbResident.name,
    email: dbResident.email,
    phone: dbResident.phone,
    emergency_contact: dbResident.emergency_contact,
    created_at: dbResident.created_at,
    updated_at: dbResident.updated_at
  };
};
