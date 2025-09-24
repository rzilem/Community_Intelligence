
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { validatePassword, validateEmail, sanitizeInput } from '@/utils/security-validation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { toast } from 'sonner';

export interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  firstName: string; // Alias for compatibility
  lastName: string;   // Alias for compatibility
}

interface SignupFormProps {
  onSuccess?: () => void;
  onSubmit?: (formData: SignupFormValues) => Promise<void>;
  isLoading?: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSubmit, isLoading: externalLoading }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<SignupFormValues>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    firstName: '', // Alias
    lastName: ''   // Alias
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof SignupFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'email' ? e.target.value : sanitizeInput(e.target.value);
    
    // Update both the main field and alias
    const updates: Partial<SignupFormValues> = { [field]: value };
    if (field === 'first_name') updates.firstName = value;
    if (field === 'last_name') updates.lastName = value;
    if (field === 'firstName') updates.first_name = value;
    if (field === 'lastName') updates.last_name = value;
    
    setFormData(prev => ({ ...prev, ...updates }));
    setError(null);
  };

  const validateForm = (): string | null => {
    // Validate email
    if (!validateEmail(formData.email)) {
      return 'Please enter a valid email address';
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      return passwordValidation.errors[0];
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    // Validate required fields
    if (!formData.first_name.trim()) {
      return 'First name is required';
    }

    if (!formData.last_name.trim()) {
      return 'Last name is required';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await signUp(formData.email, formData.password, {
          first_name: formData.first_name,
          last_name: formData.last_name
        });
        toast.success('Account created successfully! Please check your email to verify your account.');
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || externalLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up to access the HOA management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                disabled={isSubmitting}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                disabled={isSubmitting}
                maxLength={50}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isSubmitting}
              maxLength={254}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange('password')}
              disabled={isSubmitting}
              maxLength={128}
            />
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              disabled={isSubmitting}
              maxLength={128}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
