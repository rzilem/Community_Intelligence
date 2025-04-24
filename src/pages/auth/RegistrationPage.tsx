
import React from 'react';
import { Link } from 'react-router-dom';
import { RegistrationForm } from '@/components/auth/RegistrationForm';

const RegistrationPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md p-4">
        <RegistrationForm />
        <div className="text-center text-sm mt-4">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
