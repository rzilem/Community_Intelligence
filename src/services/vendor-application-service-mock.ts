// Mock implementation for vendor application service

export interface VendorApplication {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  application_status: string;
  services_offered: string[];
  created_at: string;
}

const mockVendorApplications: VendorApplication[] = [
  {
    id: 'app-1',
    business_name: 'ABC Landscaping',
    contact_person: 'John Smith',
    email: 'john@abclandscaping.com',
    phone: '555-0123',
    application_status: 'pending',
    services_offered: ['landscaping', 'maintenance'],
    created_at: new Date().toISOString()
  },
  {
    id: 'app-2',
    business_name: 'XYZ Plumbing',
    contact_person: 'Jane Doe',
    email: 'jane@xyzplumbing.com', 
    phone: '555-0456',
    application_status: 'approved',
    services_offered: ['plumbing', 'emergency'],
    created_at: new Date().toISOString()
  }
];

export async function getVendorApplications(): Promise<VendorApplication[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return [...mockVendorApplications];
}

export async function getVendorApplicationById(id: string): Promise<VendorApplication | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockVendorApplications.find(app => app.id === id) || null;
}

export async function createVendorApplication(application: Partial<VendorApplication>): Promise<VendorApplication> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newApplication: VendorApplication = {
    id: `app-${Date.now()}`,
    business_name: application.business_name || '',
    contact_person: application.contact_person || '',
    email: application.email || '',
    phone: application.phone || '',
    application_status: 'pending',
    services_offered: application.services_offered || [],
    created_at: new Date().toISOString()
  };
  
  mockVendorApplications.push(newApplication);
  return newApplication;
}

export async function updateVendorApplicationStatus(id: string, status: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const appIndex = mockVendorApplications.findIndex(app => app.id === id);
  if (appIndex !== -1) {
    mockVendorApplications[appIndex].application_status = status;
    return true;
  }
  return false;
}