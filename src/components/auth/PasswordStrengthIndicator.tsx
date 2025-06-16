
import React from 'react';
import { validatePassword } from '@/utils/security-validation';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  className = '' 
}) => {
  const { valid, errors } = validatePassword(password);
  
  // Calculate strength score
  const calculateStrength = (): number => {
    if (!password) return 0;
    
    let score = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      password.length >= 12
    ];
    
    score = checks.filter(Boolean).length;
    return Math.min(score * 20, 100);
  };

  const strength = calculateStrength();
  
  const getStrengthLabel = (): string => {
    if (strength === 0) return '';
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    if (strength < 90) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = (): string => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    if (strength < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password Strength</span>
        <span className={`font-medium ${valid ? 'text-green-600' : 'text-red-600'}`}>
          {getStrengthLabel()}
        </span>
      </div>
      
      <Progress 
        value={strength} 
        className="h-2"
        // Apply color styling
        style={{
          background: strength > 0 ? `linear-gradient(to right, ${getStrengthColor()} ${strength}%, #e5e7eb ${strength}%)` : '#e5e7eb'
        }}
      />
      
      {errors.length > 0 && (
        <ul className="text-xs text-red-600 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
