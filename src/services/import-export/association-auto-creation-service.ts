// Mock implementation for association auto-creation service

export const associationAutoCreationService = {
  findOrCreateAssociation: async (name: string): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: `assoc-${Date.now()}`,
      name: name,
      code: name.toUpperCase().replace(/\s+/g, ''),
      created: true
    };
  },

  searchExistingAssociations: async (query: string): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
      {
        id: 'assoc-1',
        name: 'Sample HOA',
        code: 'SAMPLE'
      }
    ];
  },

  detectAssociationCandidates: async (data: any): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return [
      {
        name: 'Auto-detected HOA',
        confidence: 0.85,
        source: 'data'
      }
    ];
  },

  createOrFindAssociations: async (candidates: any[]): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return candidates.map(candidate => ({
      id: `assoc-${Date.now()}-${Math.random()}`,
      name: candidate.name,
      isNew: true
    }));
  },

  validateAssociationData: async (data: any): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }
};