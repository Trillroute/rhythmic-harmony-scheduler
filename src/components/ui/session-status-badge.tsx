
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatus } from '@/lib/types';

interface SessionStatusBadgeProps {
  status: AttendanceStatus;
  size?: 'default' | 'sm';
}

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Present':
      return 'success';
    case 'Cancelled by Student':
      return 'warning';
    case 'Cancelled by Teacher':
      return 'destructive';
    case 'Cancelled by School':
      return 'outline';
    case 'Scheduled':
      return 'secondary';
    default:
      return 'default';
  }
};

const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({ status, size = 'default' }) => {
  const variant = getStatusBadgeVariant(status);
  const className = size === 'sm' ? 'text-xs py-0 px-1.5' : '';

  return (
    <Badge variant={variant as any} className={className}>{status}</Badge>
  );
};

export default SessionStatusBadge;
