
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const resaleOrderSchema = z.object({
  propertyInfo: z.object({
    propertyId: z.string().min(1, "Please select a property"),
    associationId: z.string().min(1, "Association ID is required"),
    address: z.string().min(1, "Address is required"),
    unit: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(5, "Valid ZIP code required"),
  }),
  contactInfo: z.object({
    role: z.string().min(1, "Please select your role"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Valid phone number required"),
    company: z.string().optional(),
  }),
  orderDetails: z.object({
    rushOption: z.string().min(1, "Please select processing time"),
    closingDate: z.string().min(1, "Closing date is required"),
    additionalNotes: z.string().optional(),
  }),
  payment: z.object({
    cardName: z.string().min(1, "Cardholder name is required"),
    cardNumber: z.string().min(15, "Valid card number required"),
    expiration: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Valid expiration date (MM/YY) required"),
    cvv: z.string().min(3, "Valid CVV required"),
    billingZip: z.string().min(5, "Valid billing ZIP required"),
  }),
});

export type ResaleOrderFormData = z.infer<typeof resaleOrderSchema>;

export function useResaleOrderForm() {
  const navigate = useNavigate();
  const form = useForm<ResaleOrderFormData>({
    resolver: zodResolver(resaleOrderSchema),
    defaultValues: {
      propertyInfo: {
        propertyId: '',
        associationId: '',
        address: '',
        unit: '',
        city: '',
        state: '',
        zip: '',
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
      },
    },
  });

  const onSubmit = async (data: ResaleOrderFormData) => {
    try {
      // Get the user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to place an order");
        return;
      }

      // Generate order number
      const { data: orderNumber } = await supabase.rpc('generate_order_number');

      // Insert the order into the database
      const { error: orderError } = await supabase
        .from('resale_orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          property_id: data.propertyInfo.propertyId,
          association_id: data.propertyInfo.associationId,
          type: 'resale-cert',
          rush_option: data.orderDetails.rushOption,
          amount: calculateOrderAmount(data),
          contact_info: data.contactInfo,
          property_info: data.propertyInfo,
          order_details: data.orderDetails,
          payment_info: {
            last4: data.payment.cardNumber.slice(-4),
            exp_month: data.payment.expiration.split('/')[0],
            exp_year: data.payment.expiration.split('/')[1],
          },
        });

      if (orderError) throw orderError;

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
        body: { 
          email: data.contactInfo.email,
          name: data.contactInfo.name,
          orderDetails: {
            address: data.propertyInfo.address,
            rushOption: data.orderDetails.rushOption,
            closingDate: data.orderDetails.closingDate,
          }
        }
      });

      if (emailError) console.error('Error sending confirmation email:', emailError);

      toast.success("Order placed successfully!");
      navigate('/resale-portal/my-orders');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error("Error placing order. Please try again.");
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}

function calculateOrderAmount(data: ResaleOrderFormData): number {
  const basePrice = 275; // Base price for resale certificate
  const rushPrices = {
    standard: 0,
    rush: 100,
    'super-rush': 200
  };
  return basePrice + (rushPrices[data.orderDetails.rushOption as keyof typeof rushPrices] || 0);
}
