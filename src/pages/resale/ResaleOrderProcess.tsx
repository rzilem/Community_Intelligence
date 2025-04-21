import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  User, 
  Clock, 
  DollarSign, 
  Calendar,
  CreditCard,
  Check,
  Loader2,
  Building
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { PropertySearchCombobox } from '@/components/resale/PropertySearchCombobox';
import { toast } from 'sonner';

const orderTypes = {
  'resale-cert': {
    id: 'resale-cert',
    title: 'Resale Certificate',
    description: 'Required for property sale transactions',
    basePrice: 200,
    rushOptions: [
      { id: 'standard', name: 'Standard', time: '10 business days', price: 0 },
      { id: 'rush', name: 'Rush', time: '3-5 business days', price: 50 },
      { id: 'super-rush', name: 'Super Rush', time: '1-2 business days', price: 100 },
      { id: 'same-day', name: 'Same Day', time: 'Same business day (by 5pm if ordered before 11am)', price: 150 }
    ]
  },
  'condo-quest': {
    id: 'condo-quest',
    title: 'Condo Questionnaire',
    description: 'Standard condo questionnaire for lenders',
    basePrice: 150,
    rushOptions: [
      { id: 'standard', name: 'Standard', time: '7 business days', price: 0 },
      { id: 'rush', name: 'Rush', time: '2-4 business days', price: 50 },
      { id: 'super-rush', name: 'Super Rush', time: '24 hours', price: 75 }
    ]
  },
  'mortgage-quest': {
    id: 'mortgage-quest',
    title: 'Mortgage Questionnaire',
    description: 'Detailed information for mortgage lenders',
    basePrice: 125,
    rushOptions: [
      { id: 'standard', name: 'Standard', time: '5 business days', price: 0 },
      { id: 'rush', name: 'Rush', time: '2-3 business days', price: 40 },
      { id: 'super-rush', name: 'Super Rush', time: '24 hours', price: 60 }
    ]
  },
  'disclosure-packet': {
    id: 'disclosure-packet',
    title: 'Disclosure Packet',
    description: 'Required HOA disclosure documents',
    basePrice: 175,
    rushOptions: [
      { id: 'standard', name: 'Standard', time: '7 business days', price: 0 },
      { id: 'rush', name: 'Rush', time: '3 business days', price: 50 },
      { id: 'super-rush', name: 'Super Rush', time: '24 hours', price: 75 }
    ]
  }
};

const ResaleOrderProcess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const orderTypeId = searchParams.get('type') || 'resale-cert';
  const orderType = orderTypes[orderTypeId as keyof typeof orderTypes];
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    propertyInfo: {
      address: '',
      unit: '',
      city: '',
      state: '',
      zip: '',
      community: '',
      propertyType: 'condo',
      propertyId: null,
      associationId: null
    },
    contactInfo: {
      role: 'title-company',
      name: '',
      email: '',
      phone: '',
      company: '',
    },
    orderDetails: {
      rushOption: 'standard',
      closingDate: '',
      additionalNotes: '',
    },
    payment: {
      cardName: '',
      cardNumber: '',
      expiration: '',
      cvv: '',
      billingZip: '',
    }
  });
  
  const selectedRushOption = orderType.rushOptions.find(option => option.id === formData.orderDetails.rushOption);
  const totalPrice = orderType.basePrice + (selectedRushOption?.price || 0);
  
  useEffect(() => {
    if (user && user.email) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          email: user.email || '',
        }
      }));
    }
  }, [user]);
  
  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };
  
  const handlePropertySelect = (property: Property | null) => {
    if (property) {
      setFormData(prev => ({
        ...prev,
        propertyInfo: {
          ...prev.propertyInfo,
          address: property.address,
          unit: property.unit_number || '',
          city: property.city || '',
          state: property.state || '',
          zip: property.zip || '',
          propertyId: property.id,
          associationId: property.association_id
        }
      }));
    } else {
      toast.error("Please select a valid property from the database.");
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: "Order Submitted Successfully",
        description: "Your order has been placed. You'll receive a confirmation email shortly.",
      });
      setIsSubmitting(false);
      navigate('/resale-portal/my-orders');
    }, 2000);
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/resale-portal');
    }
  };
  
  const handleNext = () => {
    if (currentStep === 1 && !formData.propertyInfo.propertyId) {
      toast.error("Please select a valid property from the database to continue");
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  return (
    <PageTemplate 
      title={`Order ${orderType.title}`}
      icon={<FileText className="h-8 w-8" />}
      description="Complete the form below to place your order"
    >
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Form</CardTitle>
              <CardDescription>
                {currentStep === 1 && "Enter property information"}
                {currentStep === 2 && "Enter your contact details"}
                {currentStep === 3 && "Select rush options and closing date"}
                {currentStep === 4 && "Complete payment to finalize your order"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Property Address</Label>
                    <PropertySearchCombobox
                      onPropertySelect={handlePropertySelect}
                      value={formData.propertyInfo.address ? 
                        `${formData.propertyInfo.address}${formData.propertyInfo.unit ? ` Unit ${formData.propertyInfo.unit}` : ''}, ${formData.propertyInfo.city}, ${formData.propertyInfo.state} ${formData.propertyInfo.zip}`
                        : undefined
                      }
                    />
                  </div>
                  
                  {formData.propertyInfo.address && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Selected Property Details
                      </h3>
                      <div className="text-sm space-y-1">
                        <p>Address: {formData.propertyInfo.address}</p>
                        {formData.propertyInfo.unit && <p>Unit: {formData.propertyInfo.unit}</p>}
                        <p>Location: {formData.propertyInfo.city}, {formData.propertyInfo.state} {formData.propertyInfo.zip}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label>Your Role</Label>
                    <RadioGroup 
                      value={formData.contactInfo.role}
                      onValueChange={(value) => handleInputChange('contactInfo', 'role', value)}
                      className="grid grid-cols-2 gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="title-company" id="title-company" />
                        <Label htmlFor="title-company">Title Company</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="real-estate-agent" id="real-estate-agent" />
                        <Label htmlFor="real-estate-agent">Real Estate Agent</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="law-office" id="law-office" />
                        <Label htmlFor="law-office">Law Office</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        value={formData.contactInfo.name}
                        onChange={(e) => handleInputChange('contactInfo', 'name', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company"
                        value={formData.contactInfo.company}
                        onChange={(e) => handleInputChange('contactInfo', 'company', e.target.value)}
                        placeholder="Your company name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                        placeholder="Your email address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone"
                        value={formData.contactInfo.phone}
                        onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                        placeholder="Your phone number"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>Processing Speed</Label>
                    <RadioGroup 
                      value={formData.orderDetails.rushOption}
                      onValueChange={(value) => handleInputChange('orderDetails', 'rushOption', value)}
                      className="grid grid-cols-1 gap-4 mt-2"
                    >
                      {orderType.rushOptions.map(option => (
                        <div 
                          key={option.id}
                          className={`flex items-center justify-between p-4 border rounded-md ${
                            formData.orderDetails.rushOption === option.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <div>
                              <Label htmlFor={option.id} className="font-medium">{option.name}</Label>
                              <p className="text-sm text-muted-foreground">{option.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {option.price === 0 ? (
                              <span className="text-sm">No additional fee</span>
                            ) : (
                              <span className="font-medium">+${option.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="closingDate">Closing Date (if known)</Label>
                    <Input 
                      id="closingDate"
                      type="date"
                      value={formData.orderDetails.closingDate}
                      onChange={(e) => handleInputChange('orderDetails', 'closingDate', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea 
                      id="additionalNotes"
                      value={formData.orderDetails.additionalNotes}
                      onChange={(e) => handleInputChange('orderDetails', 'additionalNotes', e.target.value)}
                      placeholder="Any special instructions or information..."
                      rows={4}
                    />
                  </div>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input 
                      id="cardName"
                      value={formData.payment.cardName}
                      onChange={(e) => handleInputChange('payment', 'cardName', e.target.value)}
                      placeholder="Name as it appears on card"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                      id="cardNumber"
                      value={formData.payment.cardNumber}
                      onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                      placeholder="XXXX XXXX XXXX XXXX"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiration">Expiration</Label>
                      <Input 
                        id="expiration"
                        value={formData.payment.expiration}
                        onChange={(e) => handleInputChange('payment', 'expiration', e.target.value)}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv"
                        value={formData.payment.cvv}
                        onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingZip">Billing ZIP</Label>
                      <Input 
                        id="billingZip"
                        value={formData.payment.billingZip}
                        onChange={(e) => handleInputChange('payment', 'billingZip', e.target.value)}
                        placeholder="12345"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted rounded-md">
                    <p className="text-sm mb-2">By placing this order, you agree to our Terms of Service and Privacy Policy. Payment will be processed immediately.</p>
                    <p className="text-sm">For questions, contact support at <a href="mailto:support@example.com" className="text-primary underline">support@example.com</a>.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order
                      <Check className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{orderType.title}</span>
                  <span>${orderType.basePrice.toFixed(2)}</span>
                </div>
                
                {selectedRushOption && selectedRushOption.price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{selectedRushOption.name} Processing</span>
                    <span>+${selectedRushOption.price.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="font-medium mb-2">Document Information</h3>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>
                      {formData.propertyInfo.address}
                      {formData.propertyInfo.unit && `, Unit ${formData.propertyInfo.unit}`}
                      {formData.propertyInfo.city && `, ${formData.propertyInfo.city}`}
                      {formData.propertyInfo.state && `, ${formData.propertyInfo.state}`}
                      {formData.propertyInfo.zip && ` ${formData.propertyInfo.zip}`}
                    </span>
                  </div>
                  
                  {formData.propertyInfo.community && (
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{formData.propertyInfo.community}</span>
                    </div>
                  )}
                  
                  {formData.contactInfo.name && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{formData.contactInfo.name}</span>
                    </div>
                  )}
                  
                  {formData.orderDetails.closingDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>Closing Date: {formData.orderDetails.closingDate}</span>
                    </div>
                  )}
                  
                  {selectedRushOption && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{selectedRushOption.name}: {selectedRushOption.time}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md mt-4">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4" />
                  Secure Payment
                </h3>
                <p className="text-sm">All transactions are secure and encrypted. Your credit card information is never stored on our servers.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
};

export default ResaleOrderProcess;
