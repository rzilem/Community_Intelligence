
import React from 'react';
import { CalendarIcon, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  id: string;
  name: string;
  description?: string | null;
  completed?: boolean;
  date?: string | null;
}

interface CollectionsTimelineProps {
  steps: TimelineStep[];
  currentStep?: number;
}

export function CollectionsTimeline({ steps, currentStep = 0 }: CollectionsTimelineProps) {
  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gray-200">
      {steps.map((step, index) => (
        <div key={step.id} className="relative pl-10">
          <div className={cn(
            "absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border",
            index < currentStep 
              ? "bg-green-50 border-green-500" 
              : index === currentStep
                ? "bg-blue-50 border-blue-500"
                : "bg-white border-gray-300"
          )}>
            {index < currentStep ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : index === currentStep ? (
              <Clock className="h-4 w-4 text-blue-500" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-gray-300" />
            )}
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-medium leading-snug text-gray-900">
              {step.name}
            </h3>
            {step.description && (
              <p className="text-sm text-muted-foreground">{step.description}</p>
            )}
            {step.date && (
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {step.date}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
