
import React from 'react';
import { Badge } from '@/components/ui/badge';

// Define the AttendanceStatus type if it doesn't exist in types.ts
type AttendanceStatus = 'Present' | 'Scheduled' | 'Cancelled by Student' | 
                         'Cancelled by Teacher' | 'Cancelled by School' | 'No Show';

interface SessionStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

export function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
  
  switch (status) {
    case 'Present':
      variant = "default"; // Using default instead of success which isn't in the Badge variant options
      break;
    case 'Scheduled':
      variant = "default";
      break;
    case 'Cancelled by Student':
    case 'Cancelled by Teacher':
    case 'Cancelled by School':
      variant = 'destructive';
      break;
    case 'No Show':
      variant = 'secondary';
      break;
  }
  
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
