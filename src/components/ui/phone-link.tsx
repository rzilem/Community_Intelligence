
import React from 'react';

interface PhoneLinkProps {
  phone: string;
  className?: string;
}

const PhoneLink: React.FC<PhoneLinkProps> = ({ phone, className = "" }) => {
  // Format phone number for display (remove line breaks and extra spaces)
  const formatDisplayPhone = (phoneNumber: string) => {
    return phoneNumber.replace(/\s*\n\s*/g, ' ').trim();
  };

  // Format phone number for tel: link (digits only)
  const formatTelPhone = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, '');
  };

  const displayPhone = formatDisplayPhone(phone);
  const telPhone = formatTelPhone(phone);

  return (
    <a 
      href={`tel:${telPhone}`}
      className={`text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
      title={`Call ${displayPhone}`}
    >
      {displayPhone}
    </a>
  );
};

export default PhoneLink;
