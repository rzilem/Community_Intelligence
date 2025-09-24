// Mock implementation for job service

export interface ImportJob {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total_records: number;
  processed_records: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

const mockJobs: ImportJob[] = [
  {
    id: 'job-1',
    type: 'resident_import',
    status: 'completed',
    progress: 100,
    total_records: 150,
    processed_records: 150,
    error_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const jobService = {
  createImportJob: async (options: any): Promise<ImportJob> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newJob: ImportJob = {
      id: `job-${Date.now()}`,
      type: options.importType || 'import',
      status: 'pending',
      progress: 0,
      total_records: options.totalRecords || 0,
      processed_records: 0,
      error_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockJobs.push(newJob);
    return newJob;
   },

  updateImportJobStatus: async (jobId: string, status: string, progressOrData?: number | any): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      mockJobs[index].status = status as any;
      if (typeof progressOrData === 'number') {
        mockJobs[index].progress = progressOrData;
      } else if (progressOrData && typeof progressOrData.processed === 'number') {
        mockJobs[index].processed_records = progressOrData.processed;
        mockJobs[index].progress = Math.round((progressOrData.processed / mockJobs[index].total_records) * 100);
      }
      mockJobs[index].updated_at = new Date().toISOString();
    }
  },
  getJobs: async (): Promise<ImportJob[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockJobs];
  },

  createJob: async (data: Partial<ImportJob>): Promise<ImportJob> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newJob: ImportJob = {
      id: `job-${Date.now()}`,
      type: data.type || 'import',
      status: 'pending',
      progress: 0,
      total_records: data.total_records || 0,
      processed_records: 0,
      error_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockJobs.push(newJob);
    return newJob;
  },

  updateJob: async (id: string, updates: Partial<ImportJob>): Promise<ImportJob> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockJobs.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Job not found');
    
    mockJobs[index] = {
      ...mockJobs[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockJobs[index];
  },

  deleteJob: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockJobs.findIndex(j => j.id === id);
    if (index !== -1) {
      mockJobs.splice(index, 1);
    }
  }
};