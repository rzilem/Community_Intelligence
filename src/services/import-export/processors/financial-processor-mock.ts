// Mock implementation for financial processor

export const financialProcessor = {
  process: async (jobId: string, associationId: string, processedData: any[]) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      successfulImports: processedData.length,
      failedImports: 0,
      details: [{
        status: 'success' as const,
        message: `Successfully imported ${processedData.length} financial records`
      }]
    };
  },
  processAssessments: async (data: any[], associationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      successfulImports: data.length,
      failedImports: 0,
      errors: [],
      warnings: []
    };
  },

  processTransactions: async (data: any[], associationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return {
      successfulImports: data.length,
      failedImports: 0,
      errors: [],
      warnings: []
    };
  },

  processBankStatements: async (data: any[], associationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      successfulImports: data.length,
      failedImports: 0,
      errors: [],
      warnings: []
    };
  },

  validateFinancialData: async (data: any[]) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      valid: true,
      issues: [],
      warnings: []
    };
  }
};