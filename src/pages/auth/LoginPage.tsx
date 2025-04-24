
import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
      <div className="text-center text-sm mt-4">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-primary hover:underline">
          Register
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
