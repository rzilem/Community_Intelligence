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