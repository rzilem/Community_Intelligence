
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
        
        // Fetch available tables
        try {
          const { data: tablesData } = await supabase.rpc('get_all_tables');
          if (tablesData) {
            setTables(tablesData);
          }
        } catch (e) {
          console.log('Could not fetch tables list:', e);
        }
        
        // Fetch storage buckets
        try {
          const { data: bucketsData } = await supabase.storage.listBuckets();
          if (bucketsData) {
            setBuckets(bucketsData.map(bucket => bucket.name));
          }
        } catch (e) {
          console.log('Could not fetch storage buckets:', e);
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
          <h3 className="font-medium mb-2">Tables Detected:</h3>
          {tables.length > 0 ? (
            <ul className="list-disc pl-5 text-sm">
              {tables.map((table, index) => (
                <li key={index}>{table}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No tables detected or unable to list tables</p>
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
            <p className="text-sm text-gray-500">No storage buckets detected</p>
          )}
        </div>

        <div className="pt-2 border-t">
          <h3 className="font-medium mb-2">Common Issues:</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Email confirmation might be required (check Supabase Authentication settings)</li>
            <li>Row Level Security policies might be blocking data access</li>
            <li>Storage buckets might need to be created manually</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDiagnostics;
