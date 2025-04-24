
import { useState, useEffect } from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';

export const useRequestData = (request: HomeownerRequest, onEditRequest?: (request: HomeownerRequest) => void) => {
  const [association, setAssociation] = useState<string | null>(null);
  const [resident, setResident] = useState<any | null>(null);
  const [property, setProperty] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [residentAssociation, setResidentAssociation] = useState<any | null>(null);
  const [senderEmail, setSenderEmail] = useState<string | null>(null);

  useEffect(() => {
    // In a real implementation, you would fetch this data from the API
    // For now, we'll just mock some data
    setAssociation("Homeowners Association");
    setResident({ name: "John Doe" });
    setProperty("123 Main St");
    setEmail("john.doe@example.com");
    setResidentAssociation({ name: "Parkside Association" });
    setSenderEmail("info@parkside.org");
  }, [request]);

  return {
    association,
    resident,
    property,
    email,
    residentAssociation,
    senderEmail,
  };
};
