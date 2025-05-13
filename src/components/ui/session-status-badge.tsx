
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatus } from '@/lib/types';

interface SessionStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

export function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" = "outline";
  
  switch (status) {
    case 'Present':
      variant = 'success';
      break;
    case 'Scheduled':
      variant = 'default';
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
