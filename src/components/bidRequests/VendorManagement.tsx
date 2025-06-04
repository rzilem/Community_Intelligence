import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Star, Phone, Mail, MapPin, FileText, CheckCircle, XCircle, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types defined inline
interface Vendor {
  id: string;
  hoa_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  license_number?: string;
  insurance_info?: InsuranceInfo;
  specialties: string[];
  rating?: number;
  total_jobs: number;
  completed_jobs: number;
  average_response_time?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface InsuranceInfo {
  provider?: string;
  policy_number?: string;
  coverage_amount?: number;
  expiration_date?: string;
  certificate_url?: string;
}

interface VendorFormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  license_number: string;
  specialties: string[];
  insurance_provider: string;
  insurance_policy: string;
  insurance_coverage: number;
  insurance_expiration: string;
  notes: string;
  is_active: boolean;
}

interface VendorManagementProps {
  hoaId: string;
  currentUserId: string;
  onVendorSelect?: (vendor: Vendor) => void;
}

const VendorManagement: React.FC<VendorManagementProps> = ({
  hoaId,
  currentUserId,
  onVendorSelect
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    license_number: '',
    specialties: [],
    insurance_provider: '',
    insurance_policy: '',
    insurance_coverage: 0,
    insurance_expiration: '',
    notes: '',
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const specialtyOptions = [
    'Landscaping', 'Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Painting',
    'General Maintenance', 'Pool Service', 'Security', 'Cleaning', 'Pest Control',
    'Tree Service', 'Concrete', 'Fencing', 'Appliance Repair'
  ];

  useEffect(() => {
    loadVendors();
  }, [hoaId]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('hoa_id', hoaId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading vendors:', error);
        toast.error('Failed to load vendors');
        setVendors([]);
      } else {
        setVendors((data || []) as Vendor[]);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = specialtyFilter === 'all' || 
                            vendor.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && vendor.is_active) ||
                         (statusFilter === 'inactive' && !vendor.is_active);

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (formData.specialties.length === 0) newErrors.specialties = 'At least one specialty is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const vendorData = {
        hoa_id: hoaId,
        name: formData.name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        license_number: formData.license_number,
        specialties: formData.specialties,
        insurance_info: {
          provider: formData.insurance_provider,
          policy_number: formData.insurance_policy,
          coverage_amount: formData.insurance_coverage,
          expiration_date: formData.insurance_expiration
        },
        notes: formData.notes,
        is_active: formData.is_active,
        total_jobs: editingVendor?.total_jobs || 0,
        completed_jobs: editingVendor?.completed_jobs || 0
      };

      let error;
      if (editingVendor) {
        ({ error } = await supabase
          .from('vendors')
          .update(vendorData)
          .eq('id', editingVendor.id));
        if (!error) {
          toast.success('Vendor updated');
        }
      } else {
        ({ error } = await supabase
          .from('vendors')
          .insert(vendorData));
        if (!error) {
          toast.success('Vendor created');
        }
      }

      if (error) {
        console.error('Error saving vendor:', error);
        toast.error('Failed to save vendor');
      } else {
        setShowForm(false);
        setEditingVendor(null);
        resetForm();
        await loadVendors();
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error('Failed to save vendor');
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      license_number: vendor.license_number || '',
      specialties: vendor.specialties,
      insurance_provider: vendor.insurance_info?.provider || '',
      insurance_policy: vendor.insurance_info?.policy_number || '',
      insurance_coverage: vendor.insurance_info?.coverage_amount || 0,
      insurance_expiration: vendor.insurance_info?.expiration_date || '',
      notes: vendor.notes || '',
      is_active: vendor.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (vendorId: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const { error } = await supabase
          .from('vendors')
          .delete()
          .eq('id', vendorId);

        if (error) {
          console.error('Error deleting vendor:', error);
          toast.error('Failed to delete vendor');
        } else {
          toast.success('Vendor deleted');
          await loadVendors();
        }
      } catch (error) {
        console.error('Error deleting vendor:', error);
        toast.error('Failed to delete vendor');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      license_number: '',
      specialties: [],
      insurance_provider: '',
      insurance_policy: '',
      insurance_coverage: 0,
      insurance_expiration: '',
      notes: '',
      is_active: true
    });
    setErrors({});
  };

  const toggleSpecialty = (specialty: string) => {
    const currentSpecialties = formData.specialties;
    if (currentSpecialties.includes(specialty.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        specialties: currentSpecialties.filter(s => s !== specialty.toLowerCase())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        specialties: [...currentSpecialties, specialty.toLowerCase()]
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">Manage your community's trusted vendors</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Specialties</option>
            {specialtyOptions.map(specialty => (
              <option key={specialty} value={specialty.toLowerCase()}>{specialty}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredVendors.length} vendors
          </div>
        </div>
      </div>

      {/* Vendor Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingVendor(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="ABC Landscaping"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="John Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="john@abclandscaping.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="123 Main St, Austin, TX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">License Number</label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="LND-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Specialties *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {specialtyOptions.map(specialty => (
                      <label key={specialty} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(specialty.toLowerCase())}
                          onChange={() => toggleSpecialty(specialty)}
                          className="rounded"
                        />
                        <span className="text-sm">{specialty}</span>
                      </label>
                    ))}
                  </div>
                  {errors.specialties && <p className="text-red-500 text-sm mt-1">{errors.specialties}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Insurance Provider</label>
                    <input
                      type="text"
                      value={formData.insurance_provider}
                      onChange={(e) => setFormData(prev => ({ ...prev, insurance_provider: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="State Farm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Policy Number</label>
                    <input
                      type="text"
                      value={formData.insurance_policy}
                      onChange={(e) => setFormData(prev => ({ ...prev, insurance_policy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="SF-123456"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Additional notes about this vendor..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm">Active vendor</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVendor(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingVendor ? 'Update' : 'Add'} Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading vendors...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No vendors found</p>
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{vendor.name}</h3>
                  {vendor.contact_person && (
                    <p className="text-gray-600">{vendor.contact_person}</p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {vendor.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {vendor.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {vendor.email}
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {vendor.phone}
                  </div>
                )}
                {vendor.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {vendor.address}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {vendor.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 text-sm">
                {vendor.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{vendor.rating}/5</span>
                  </div>
                )}
                <div className="text-gray-600">
                  {vendor.completed_jobs}/{vendor.total_jobs} jobs
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(vendor)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(vendor.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {onVendorSelect && (
                  <button
                    onClick={() => onVendorSelect(vendor)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Select
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorManagement;
