import 'ts-node/register';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';
import { mockProperties } from '../src/components/properties/PropertyData';
import { mockHomeowners } from '../src/pages/homeowners/homeowner-data';
import { mockVendors } from '../src/data/vendors-data';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cahergndkwfqltxyikyr.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE) {
  console.error('SUPABASE_SERVICE_ROLE_KEY env var required');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE);

async function run() {
  console.log(`Importing ${mockProperties.length} properties...`);
  for (const p of mockProperties) {
    const { error } = await supabase.from('properties').insert({
      id: p.id,
      address: p.address,
      city: p.city,
      state: p.state,
      zip_code: p.zip,
      property_type: p.type,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      square_footage: p.sqFt,
      association_id: p.associationId,
      status: p.status
    });
    if (error) console.error('Property import error', p.id, error.message);
  }

  console.log(`Importing ${mockHomeowners.length} homeowners...`);
  for (const h of mockHomeowners) {
    const { error } = await supabase.from('homeowners').insert({
      id: h.id,
      full_homeowner_name: h.name,
      email: h.email,
      phone: h.phone,
      homeowner_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Homeowner import error', h.id, error.message);
  }

  console.log(`Importing ${mockVendors.length} vendors...`);
  for (const v of mockVendors) {
    const { error } = await supabase.from('vendors').insert({
      id: v.id,
      name: v.name,
      email: v.email || null,
      phone: v.phone || null,
      status: v.status,
      rating: v.rating
    });
    if (error) console.error('Vendor import error', v.id, error.message);
  }

  console.log('Import complete.');
}

run().then(() => process.exit()).catch(err => { console.error(err); process.exit(1); });
