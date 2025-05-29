
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Upload, X, AlertCircle, CheckCircle, Calendar, DollarSign, Users, FileText, Settings, Eye } from 'lucide-react';
import { useProjectTypes } from '@/hooks/bid-requests/useProjectTypes';
import EnhancedProjectTypeSelector from './form/EnhancedProjectTypeSelector';
import { useForm } from 'react-hook-form';

// Types defined inline
interface BidRequestFormData {
  hoa_id: string;
  title: string;
  description: string;
  location: string;
  number_of_bids_wanted: number;
  project_type_id: string;
  category: string;
  project_details: Record<string, any>;
  special_requirements?: string;
  selected_vendor_ids: string[];
  allow_public_bidding: boolean;
  budget_range_min?: number;
  budget_range_max?: number;
  preferred_start_date?: string;
  required_completion_date?: string;
  bid_deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: File[];
  created_by: string;
  status: 'draft' | 'published';
}

interface Vendor {
  id: string;
  hoa_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  specialties: string[];
  rating?: number;
  total_jobs: number;
  completed_jobs: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BidRequestFormProps {
  onSubmit: (data: BidRequestFormData) => Promise<void>;
  onSaveDraft: (data: BidRequestFormData) => Promise<void>;
  initialData?: Partial<BidRequestFormData>;
  hoaId: string;
  currentUserId: string;
}

const BidRequestForm: React.FC<BidRequestFormProps> = ({
  onSubmit,
  onSaveDraft,
  initialData,
  hoaId,
  currentUserId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BidRequestFormData>({
    hoa_id: hoaId,
    title: '',
    description: '',
    location: '',
    number_of_bids_wanted: 3,
    project_type_id: '',
    category: '',
    project_details: {},
    selected_vendor_ids: [],
    allow_public_bidding: true,
    bid_deadline: '',
    priority: 'medium',
    attachments: [],
    created_by: currentUserId,
    status: 'draft',
    ...initialData
  });

  const { data: projectTypes, isLoading: projectTypesLoading } = useProjectTypes();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create form instance for the enhanced project type selector
  const form = useForm<BidRequestFormData>({
    defaultValues: formData
  });

  const steps = [
    { id: 1, name: 'Basic Info', icon: FileText, description: 'Community, address, and overview' },
    { id: 2, name: 'Project Type', icon: Settings, description: 'Select your project category' },
    { id: 3, name: 'Details', icon: AlertCircle, description: 'Project specifications' },
    { id: 4, name: 'Vendors', icon: Users, description: 'Choose who can bid' },
    { id: 5, name: 'Budget & Timeline', icon: Calendar, description: 'Set budget and deadlines' },
    { id: 6, name: 'Review', icon: Eye, description: 'Files and final review' }
  ];

  useEffect(() => {
    loadVendors();
  }, []);

  // Sync form data with react-hook-form
  useEffect(() => {
    form.reset(formData);
  }, [formData, form]);

  const loadVendors = async () => {
    setVendors([
      {
        id: '1',
        hoa_id: hoaId,
        name: 'ABC Landscaping',
        contact_person: 'John Smith',
        email: 'john@abclandscaping.com',
        phone: '555-0101',
        specialties: ['landscaping', 'irrigation'],
        rating: 4.5,
        total_jobs: 45,
        completed_jobs: 42,
        is_active: true,
        created_at: '',
        updated_at: ''
      }
    ]);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;
      case 2:
        if (!formData.project_type_id) newErrors.project_type = 'Please select a project type';
        break;
      case 5:
        if (!formData.bid_deadline) newErrors.bid_deadline = 'Bid deadline is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updateFormData = (updates: Partial<BidRequestFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setLoading(true);
    try {
      const dataToSubmit = { 
        ...formData, 
        status: (isDraft ? 'draft' : 'published') as 'draft' | 'published'
      };
      if (isDraft) {
        await onSaveDraft(dataToSubmit);
      } else {
        await onSubmit(dataToSubmit);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Project Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., Pool Area Renovation"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Provide detailed description of the work needed..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location/Address *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData({ location: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Specific location within the community"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Bids Wanted</label>
              <select
                value={formData.number_of_bids_wanted}
                onChange={(e) => updateFormData({ number_of_bids_wanted: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={1}>1 Bid</option>
                <option value={2}>2 Bids</option>
                <option value={3}>3 Bids</option>
                <option value={4}>4 Bids</option>
                <option value={5}>5+ Bids</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Select Project Type</h3>
            
            {projectTypesLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading project types...</p>
              </div>
            ) : (
              <EnhancedProjectTypeSelector 
                form={form}
                onChange={(projectTypeId, categorySlug) => {
                  updateFormData({ 
                    project_type_id: projectTypeId, 
                    category: categorySlug 
                  });
                }}
              />
            )}
            
            {errors.project_type && <p className="text-red-500 text-sm">{errors.project_type}</p>}
          </div>
        );

      case 3:
        const selectedProjectType = projectTypes?.find(pt => pt.id === formData.project_type_id);
        
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Project Details</h3>
            
            {selectedProjectType?.conditional_fields && Object.entries(selectedProjectType.conditional_fields).map(([key, field]: [string, any]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">
                  {field.label} {field.required && '*'}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={formData.project_details[key] || ''}
                    onChange={(e) => updateFormData({ 
                      project_details: { ...formData.project_details, [key]: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                )}
                
                {field.type === 'number' && (
                  <input
                    type="number"
                    value={formData.project_details[key] || ''}
                    onChange={(e) => updateFormData({ 
                      project_details: { ...formData.project_details, [key]: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                )}
                
                {field.type === 'select' && (
                  <select
                    value={formData.project_details[key] || ''}
                    onChange={(e) => updateFormData({ 
                      project_details: { ...formData.project_details, [key]: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((option: string) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-2">Special Requirements</label>
              <textarea
                value={formData.special_requirements || ''}
                onChange={(e) => updateFormData({ special_requirements: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Any additional requirements or specifications..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Vendor Selection</h3>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allow_public_bidding}
                  onChange={(e) => updateFormData({ allow_public_bidding: e.target.checked })}
                  className="rounded"
                />
                <span>Allow public bidding (any qualified vendor can respond)</span>
              </label>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Select Specific Vendors (Optional)</h4>
              {vendors.map((vendor) => (
                <label key={vendor.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.selected_vendor_ids.includes(vendor.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFormData({ 
                          selected_vendor_ids: [...formData.selected_vendor_ids, vendor.id]
                        });
                      } else {
                        updateFormData({
                          selected_vendor_ids: formData.selected_vendor_ids.filter(id => id !== vendor.id)
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-gray-600">{vendor.specialties.join(', ')}</div>
                    {vendor.rating && (
                      <div className="text-sm text-yellow-600">Rating: {vendor.rating}/5</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Budget & Timeline</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.budget_range_min || ''}
                    onChange={(e) => updateFormData({ budget_range_min: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Maximum Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.budget_range_max || ''}
                    onChange={(e) => updateFormData({ budget_range_max: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Start Date</label>
                <input
                  type="date"
                  value={formData.preferred_start_date || ''}
                  onChange={(e) => updateFormData({ preferred_start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Required Completion Date</label>
                <input
                  type="date"
                  value={formData.required_completion_date || ''}
                  onChange={(e) => updateFormData({ required_completion_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bid Deadline *</label>
                <input
                  type="datetime-local"
                  value={formData.bid_deadline}
                  onChange={(e) => updateFormData({ bid_deadline: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${errors.bid_deadline ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.bid_deadline && <p className="text-red-500 text-sm mt-1">{errors.bid_deadline}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => updateFormData({ priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Files & Review</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Attachments</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag files here or click to upload
                </p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      updateFormData({ attachments: Array.from(e.target.files) });
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 mt-2">
                  Select Files
                </label>
              </div>
            </div>

            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files:</h4>
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{file.name}</span>
                    <button
                      onClick={() => {
                        const newFiles = formData.attachments.filter((_, i) => i !== index);
                        updateFormData({ attachments: newFiles });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Review Your Bid Request</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium">Title:</dt>
                  <dd>{formData.title}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Project Type:</dt>
                  <dd>{projectTypes?.find(pt => pt.id === formData.project_type_id)?.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Priority:</dt>
                  <dd className="capitalize">{formData.priority}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Bid Deadline:</dt>
                  <dd>{new Date(formData.bid_deadline).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 min-h-96">
        {renderStepContent()}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Bid Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidRequestForm;
