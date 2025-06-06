import 'ts-node/register';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cahergndkwfqltxyikyr.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE) {
  console.error('SUPABASE_SERVICE_ROLE_KEY env var required');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE);

type CsvRow = Record<string, string>;

function mapVendor(row: CsvRow) {
  return {
    name: row['Provider Name'] || row['DBA'] || row['Check Name'],
    phone: row['Phone'] || null,
    email: row['eMail'] || null,
    address:
      [row['Street No'], row['Address1'], row['Address2'], row['City'], row['State'], row['Zip']]
        .filter(Boolean)
        .join(' ') || null,
    license_number: row['Service Provider ID'] ? String(row['Service Provider ID']) : null,
    has_insurance: row['Is Compliant'] === 'true',
    status: row['Hold Payment'] === 'true' ? 'on-hold' : 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function run(csvPath: string) {
  const csv = fs.readFileSync(csvPath, 'utf8');
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as CsvRow[];
  for (const record of records) {
    const vendor = mapVendor(record);
    const { error } = await supabase.from('vendors').insert(vendor);
    if (error) {
      console.error('Error inserting vendor', vendor.name, error.message);
    } else {
      console.log('Inserted vendor', vendor.name);
    }
  }
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/import-vendors-from-csv.ts path/to/vendors.csv');
  process.exit(1);
}

run(csvPath)
  .then(() => {
    console.log('Import complete');
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
