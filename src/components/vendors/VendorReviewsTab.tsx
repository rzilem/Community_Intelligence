
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { VendorReviewFormData } from "@/types/vendor-extended-types";
import { useAuth } from "@/contexts/auth";
import { Plus, Star, User, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface VendorReviewsTabProps {
  vendorId: string;
}

const VendorReviewsTab: React.FC<VendorReviewsTabProps> = ({ vendorId }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentAssociation } = useAuth();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => vendorExtendedService.getVendorReviews(vendorId),
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: VendorReviewFormData) => 
      vendorExtendedService.createVendorReview(vendorId, currentAssociation?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      setIsAddDialogOpen(false);
      toast({ title: "Review added successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error adding review", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: VendorReviewFormData = {
      rating: parseInt(formData.get('rating') as string),
      review_text: formData.get('review_text') as string || undefined,
      job_reference: formData.get('job_reference') as string || undefined,
    };
    createReviewMutation.mutate(data);
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(parseFloat(getAverageRating())))}
              <span className="text-sm text-gray-600">
                {getAverageRating()} ({reviews.length} reviews)
              </span>
            </div>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="mt-2">
                  <StarRatingInput name="rating" />
                </div>
              </div>
              <div>
                <Label htmlFor="job_reference">Job Reference (Optional)</Label>
                <Input 
                  id="job_reference" 
                  name="job_reference"
                  placeholder="e.g., Pool maintenance - June 2024"
                />
              </div>
              <div>
                <Label htmlFor="review_text">Review (Optional)</Label>
                <Textarea 
                  id="review_text" 
                  name="review_text"
                  placeholder="Share your experience with this vendor..."
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={createReviewMutation.isPending}>
                {createReviewMutation.isPending ? 'Adding...' : 'Add Review'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No reviews yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">
                        {review.reviewer?.first_name && review.reviewer?.last_name
                          ? `${review.reviewer.first_name} ${review.reviewer.last_name}`
                          : review.reviewer?.email || 'Anonymous'
                        }
                      </span>
                    </div>
                    {review.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    {renderStars(review.rating)}
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(review.review_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                
                {review.job_reference && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Job:</strong> {review.job_reference}
                  </p>
                )}
                
                {review.review_text && (
                  <p className="text-gray-700">{review.review_text}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Star rating input component
const StarRatingInput: React.FC<{ name: string }> = ({ name }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      <input type="hidden" name={name} value={rating} />
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            star <= (hoverRating || rating)
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300 hover:text-yellow-400'
          }`}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        />
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          {rating} star{rating !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default VendorReviewsTab;
