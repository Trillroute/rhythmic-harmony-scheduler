
import React from 'react';
import { Badge } from '@/components/ui/badge';

// Define the component to accept any string status
interface SessionStatusBadgeProps {
  status: string;
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
    case 'Absent':
      variant = 'secondary';
      break;
  }
  
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
