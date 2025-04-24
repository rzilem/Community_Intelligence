
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Association {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AssociationContextType {
  currentAssociation: Association | null;
  setCurrentAssociation: React.Dispatch<React.SetStateAction<Association | null>>;
  isLoading: boolean;
}

const AssociationContext = createContext<AssociationContextType | undefined>(undefined);

export const AssociationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAssociation, setCurrentAssociation] = useState<Association | null>({
    id: '1',
    name: 'Sample Association'
  });
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AssociationContext.Provider
      value={{
        currentAssociation,
        setCurrentAssociation,
        isLoading
      }}
    >
      {children}
    </AssociationContext.Provider>
  );
};

export const useAssociationContext = (): AssociationContextType => {
  const context = useContext(AssociationContext);
  if (!context) {
    throw new Error('useAssociationContext must be used within an AssociationProvider');
  }
  return context;
};
