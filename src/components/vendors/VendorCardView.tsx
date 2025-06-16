
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Phone, Mail, Building2, Award } from 'lucide-react';
import { Vendor } from '@/types/vendor-types';
import { Link } from 'react-router-dom';
import PhoneLink from '@/components/ui/phone-link';

interface VendorCardViewProps {
  vendors: Vendor[];
}

const VendorCardView: React.FC<VendorCardViewProps> = ({ vendors }) => {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < Math.floor(rating) 
          ? "fill-yellow-400 text-yellow-400" 
          : "text-gray-300"} 
      />
    ));
  };

  const parseEmails = (email: string | undefined): string[] => {
    if (!email) return [];
    return email.split(',').map(e => e.trim()).filter(e => e.length > 0);
  };

  const renderEmails = (emails: string[]) => {
    if (emails.length === 0) return null;
    
    return (
      <div className="space-y-1">
        {emails.map((email, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={14} />
            <a 
              href={`mailto:${email}`} 
              className="truncate hover:text-blue-600 transition-colors"
            >
              {email}
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vendors.map((vendor) => (
        <Card key={vendor.id} className="hover:shadow-md transition-shadow duration-200 group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Link 
                  to={`/operations/vendors/${vendor.id}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 group-hover:underline"
                >
                  {vendor.name}
                </Link>
                {vendor.contact_person && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {vendor.contact_person}
                  </p>
                )}
              </div>
              <Badge 
                variant={vendor.is_active ? "default" : "secondary"}
                className={vendor.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}
              >
                {vendor.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {renderEmails(parseEmails(vendor.email))}
              {vendor.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-muted-foreground" />
                  <PhoneLink phone={vendor.phone} className="text-sm" />
                </div>
              )}
            </div>

            {/* Rating & Jobs */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {vendor.rating ? (
                  <>
                    <div className="flex items-center gap-1">
                      {renderStars(vendor.rating)}
                    </div>
                    <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No rating</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Award size={14} />
                <span>{vendor.total_jobs || 0} jobs</span>
              </div>
            </div>

            {/* Specialties */}
            {vendor.specialties && vendor.specialties.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {vendor.specialties.slice(0, 4).map((specialty, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {specialty}
                    </Badge>
                  ))}
                  {vendor.specialties.length > 4 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
                    >
                      +{vendor.specialties.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to={`/operations/vendors/${vendor.id}`}>
                <Building2 size={14} className="mr-2" />
                View Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VendorCardView;
