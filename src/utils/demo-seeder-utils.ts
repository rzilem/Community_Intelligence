
import { faker } from '@faker-js/faker';
import { supabase } from '@/integrations/supabase/client';

export async function seedProperties(associationId: string, count: number) {
  const propertiesToInsert = Array.from({ length: count }, () => ({
    association_id: associationId,
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
    property_type: faker.helpers.arrayElement(['Single Family', 'Townhouse', 'Condo', 'Apartment']),
    square_feet: faker.number.int({ min: 800, max: 3000 }),
    bedrooms: faker.number.int({ min: 1, max: 5 }),
    bathrooms: faker.number.int({ min: 1, max: 4 }),
    year_built: faker.number.int({ min: 1950, max: 2023 }),
    status: 'active'
  }));

  const { error } = await supabase
    .from('properties')
    .insert(propertiesToInsert);

  if (error) throw error;
}

export async function seedResidents(associationId: string, count: number) {
  const residentProperties = await supabase
    .from('properties')
    .select('id')
    .eq('association_id', associationId);

  const propertyIds = residentProperties.data?.map(p => p.id) || [];

  const residentsToInsert = Array.from({ length: count }, () => ({
    association_id: associationId,
    property_id: faker.helpers.arrayElement(propertyIds),
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    email: faker.internet.email(),
    phone: faker.phone.number(),
    resident_type: faker.helpers.arrayElement(['owner', 'tenant']),
    move_in_date: faker.date.past().toISOString(),
    preferences: {}
  }));

  const { error } = await supabase
    .from('residents')
    .insert(residentsToInsert);

  if (error) throw error;
}

export async function seedDocuments(associationId: string, count: number) {
  const documentsToInsert = Array.from({ length: count }, () => ({
    association_id: associationId,
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    file_type: faker.helpers.arrayElement(['pdf', 'docx', 'txt']),
    url: faker.internet.url(),
    is_public: faker.datatype.boolean(),
    category: faker.helpers.arrayElement(['bylaws', 'minutes', 'financial', 'other']),
    file_size: faker.number.int({ min: 100000, max: 5000000 })
  }));

  const { error } = await supabase
    .from('documents')
    .insert(documentsToInsert);

  if (error) throw error;
}

export async function seedCalendarEvents(associationId: string, count: number) {
  const calendarEventsToInsert = Array.from({ length: count }, () => {
    const startDate = faker.date.future();
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 2);
    
    return {
      hoa_id: associationId,
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      event_type: faker.helpers.arrayElement(['meeting', 'social', 'maintenance', 'other']),
      visibility: faker.helpers.arrayElement(['public', 'private'])
    };
  });

  const { error } = await supabase
    .from('calendar_events')
    .insert(calendarEventsToInsert);

  if (error) throw error;
}
