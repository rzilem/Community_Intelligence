
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SupabaseDiagnostics: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [buckets, setBuckets] = useState<string[]>([]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
          setErrorMessage(error.message);
          return;
        }
        
        setConnectionStatus('connected');
        
        // Fetch available tables by querying pg_tables instead of using RPC
        try {
          // Query public schema tables through PostgreSQL system tables
          const { data: tablesData } = await supabase
            .from('_metadata')
            .select('*')
            .limit(10);  // Just get some metadata to see if we can access anything
            
          // If we reach here, connection works but we may not have proper metadata tables
          // Try to get tables directly from information_schema (may be blocked by RLS)
          const { data: schemaData, error: schemaError } = await supabase.rpc('get_schema_info');
          
          if (schemaData && Array.isArray(schemaData)) {
            const tableNames = schemaData.map(item => item.table_name || '').filter(Boolean);
            setTables(tableNames);
          } else if (schemaError) {
            console.log('Could not fetch tables list via RPC:', schemaError);
            setTables([]);
          } else {
            // Fallback if both approaches fail
            console.log('Connected to Supabase, but could not list tables');
            setTables([]);
          }
        } catch (e) {
          console.log('Could not fetch tables list:', e);
          setTables([]);
        }
        
        // Fetch storage buckets
        try {
          const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
          if (bucketsData && Array.isArray(bucketsData)) {
            setBuckets(bucketsData.map(bucket => bucket.name));
          } else {
            console.log('No buckets found or error:', bucketsError);
            setBuckets([]);
          }
        } catch (e) {
          console.log('Could not fetch storage buckets:', e);
          setBuckets([]);
        }
        
      } catch (err: any) {
        console.error('Unexpected error checking Supabase:', err);
        setConnectionStatus('error');
        setErrorMessage(err.message || 'Unknown error');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Supabase Connection Diagnostics</h2>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <span className="font-medium mr-2">Connection Status:</span>
          {connectionStatus === 'checking' && (
            <span className="text-yellow-500 flex items-center">
              <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
              Checking...
            </span>
          )}
          {connectionStatus === 'connected' && (
            <span className="text-green-500 flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              Connected
            </span>
          )}
          {connectionStatus === 'error' && (
            <span className="text-red-500 flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
              Error
            </span>
          )}
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-2">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}
        
        <div>
          <h3 className="font-medium mb-2">Database Status:</h3>
          <p className="text-sm text-gray-700">
            {connectionStatus === 'connected' 
              ? 'Successfully connected to Supabase database' 
              : connectionStatus === 'checking' 
                ? 'Checking database connection...'
                : 'Failed to connect to database'}
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Tables Detected:</h3>
          {tables.length > 0 ? (
            <ul className="list-disc pl-5 text-sm">
              {tables.map((table, index) => (
                <li key={index}>{table}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              {connectionStatus === 'connected' 
                ? 'No tables detected or unable to list tables due to permissions' 
                : 'Check connection to detect tables'}
            </p>
          )}
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Storage Buckets:</h3>
          {buckets.length > 0 ? (
            <ul className="list-disc pl-5 text-sm">
              {buckets.map((bucket, index) => (
                <li key={index}>{bucket}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              {connectionStatus === 'connected' 
                ? 'No storage buckets detected' 
                : 'Check connection to detect buckets'}
            </p>
          )}
        </div>

        <div className="pt-2 border-t">
          <h3 className="font-medium mb-2">Common Issues:</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Email confirmation might be required (check Supabase Authentication settings)</li>
            <li>Row Level Security policies might be blocking data access</li>
            <li>Storage buckets might need to be created manually</li>
            <li>Database functions like 'get_all_tables' might not exist in your Supabase instance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDiagnostics;
