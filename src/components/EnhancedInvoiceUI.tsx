// Main UI component for AI invoice processing
import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Bot, 
  Check, 
  X, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Save, 
  RotateCcw,
  Zap,
  FileText,
  DollarSign,
  Calendar,
  Building,
  Loader2,
  ChevronDown
} from 'lucide-react';

interface InvoiceLineItem {
  id?: string;
  description: string;
  amount: number;
  suggested_gl_account: string;
  suggested_category: string;
  confidence: number;
  property_assignment?: string;
  is_edited?: boolean;
}

interface ProcessedInvoice {
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  line_items: InvoiceLineItem[];
  confidence_score: number;
  raw_text: string;
}

interface EnhancedInvoiceUIProps {
  associationId: string;
  userId?: string;
  onInvoiceSaved?: (invoice: any) => void;
  className?: string;
}

const EnhancedInvoiceUI: React.FC<EnhancedInvoiceUIProps> = ({ 
  associationId, 
  userId,
  onInvoiceSaved, 
  className 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [processedInvoice, setProcessedInvoice] = useState<ProcessedInvoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<string | null>(null);
  const [glAccounts, setGLAccounts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadReferenceData();
  }, [associationId]);

  const loadReferenceData = async () => {
    try {
      // Load GL accounts - adjust this to match your existing API structure
      const glResponse = await fetch(`/api/gl-accounts?association_id=${associationId}`);
      if (glResponse.ok) {
        const glData = await glResponse.json();
        setGLAccounts(glData);
      }

      // Load vendors - adjust this to match your existing API structure
      const vendorsResponse = await fetch(`/api/vendors?association_id=${associationId}`);
      if (vendorsResponse.ok) {
        const vendorsData = await vendorsResponse.json();
        setVendors(vendorsData);
      }

      // Load properties - adjust this to match your existing API structure
      const propertiesResponse = await fetch(`/api/properties?association_id=${associationId}`);
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid file type (JPEG, PNG, GIF, or PDF)');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setError('');
      setSelectedFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreviewUrl(''); // PDF preview not supported
      }
      
      // Reset processed invoice
      setProcessedInvoice(null);
    }
  };

  const processInvoiceWithAI = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append('invoice', selectedFile);
      formData.append('association_id', associationId);

      const uploadResponse = await fetch('/api/invoices/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error || 'Failed to upload file');
      }

      const { fileUrl } = await uploadResponse.json();

      // Step 2: Process with AI
      const processResponse = await fetch('/api/ai/process-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: fileUrl,
          associationId: associationId
        })
      });

      if (!processResponse.ok) {
        const processError = await processResponse.json();
        throw new Error(processError.error || 'Failed to process invoice');
      }

      const processedInvoice = await processResponse.json();
      setProcessedInvoice(processedInvoice);

    } catch (error) {
      console.error('Error processing invoice:', error);
      setError((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    if (!processedInvoice) return;

    const updatedLineItems = [...processedInvoice.line_items];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value,
      is_edited: true
    };

    setProcessedInvoice({
      ...processedInvoice,
      line_items: updatedLineItems
    });
  };

  const saveInvoice = async () => {
    if (!processedInvoice) return;

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/invoices/save-processed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...processedInvoice,
          association_id: associationId,
          user_id: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save invoice');
      }

      const savedInvoice = await response.json();
      
      if (onInvoiceSaved) {
        onInvoiceSaved(savedInvoice);
      }

      // Reset form
      setSelectedFile(null);
      setImagePreviewUrl('');
      setProcessedInvoice(null);
      
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <Check className="w-4 h-4" />;
    if (confidence >= 0.6) return <AlertTriangle className="w-4 h-4" />;
    return <X className="w-4 h-4" />;
  };

  return (
    <div className={`h-full bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Invoice Processing</h2>
          </div>
          
          {processedInvoice && (
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm border ${getConfidenceColor(processedInvoice.confidence_score)}`}>
                {getConfidenceIcon(processedInvoice.confidence_score)}
                <span className="ml-1">
                  {Math.round(processedInvoice.confidence_score * 100)}% Confidence
                </span>
              </div>
              
              <button
                onClick={saveInvoice}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Invoice'}
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-full">
        {/* Left Panel - Image Preview */}
        <div className="w-1/2 border-r border-gray-200 p-4">
          <div className="h-full flex flex-col">
            {/* Upload Area */}
            {!imagePreviewUrl && !selectedFile && (
              <div 
                className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Upload Invoice Image</p>
                <p className="text-sm text-gray-500 text-center">
                  Click to select or drag and drop<br />
                  Supports PDF, JPG, PNG formats<br />
                  Maximum file size: 10MB
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* File Selected */}
            {selectedFile && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    {selectedFile.type.startsWith('image/') ? 'Invoice Preview' : 'File Selected'}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      title="Select different file"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    
                    {!processedInvoice && (
                      <button
                        onClick={processInvoiceWithAI}
                        disabled={isProcessing}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        {isProcessing ? 'Processing...' : 'Process with AI'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Image Preview or File Info */}
                {imagePreviewUrl ? (
                  <div className="flex-1 overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={imagePreviewUrl}
                      alt="Invoice preview"
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </div>
                ) : (
                  <div className="flex-1 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Processed Data */}
        <div className="w-1/2 p-4 overflow-y-auto">
          {!processedInvoice && !isProcessing && (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">AI Invoice Processing</p>
                <p className="text-sm">
                  Upload an invoice image to automatically extract and code the data
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
                <p className="text-lg font-medium text-gray-700 mb-2">Processing Invoice...</p>
                <p className="text-sm text-gray-500">
                  AI is extracting and coding the invoice data
                </p>
              </div>
            </div>
          )}

          {processedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      value={processedInvoice.vendor_name}
                      onChange={(e) => setProcessedInvoice({
                        ...processedInvoice,
                        vendor_name: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={processedInvoice.invoice_number}
                      onChange={(e) => setProcessedInvoice({
                        ...processedInvoice,
                        invoice_number: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={processedInvoice.invoice_date}
                      onChange={(e) => setProcessedInvoice({
                        ...processedInvoice,
                        invoice_date: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={processedInvoice.total_amount}
                        onChange={(e) => setProcessedInvoice({
                          ...processedInvoice,
                          total_amount: parseFloat(e.target.value) || 0
                        })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
                
                <div className="space-y-3">
                  {processedInvoice.line_items.map((item, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${item.is_edited ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getConfidenceColor(item.confidence)}`}>
                              {getConfidenceIcon(item.confidence)}
                              <span className="ml-1">{Math.round(item.confidence * 100)}%</span>
                            </span>
                            {item.is_edited && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edited
                              </span>
                            )}
                          </div>
                          
                          <textarea
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={2}
                          />
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${item.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            GL Account
                          </label>
                          {glAccounts.length > 0 ? (
                            <select
                              value={item.suggested_gl_account}
                              onChange={(e) => updateLineItem(index, 'suggested_gl_account', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select GL Account</option>
                              {glAccounts.map((account) => (
                                <option key={account.account_code} value={account.account_code}>
                                  {account.account_code} - {account.account_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={item.suggested_gl_account}
                              onChange={(e) => updateLineItem(index, 'suggested_gl_account', e.target.value)}
                              placeholder="Enter GL Account"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={item.suggested_category}
                            onChange={(e) => updateLineItem(index, 'suggested_category', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      {properties.length > 0 && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Property Assignment (Optional)
                          </label>
                          <select
                            value={item.property_assignment || ''}
                            onChange={(e) => updateLineItem(index, 'property_assignment', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Common Area</option>
                            {properties.map((property) => (
                              <option key={property.id} value={property.id}>
                                {property.unit_number} - {property.address}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedInvoiceUI;
