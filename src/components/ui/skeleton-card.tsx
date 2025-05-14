
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SkeletonCardProps {
  header?: boolean;
  rows?: number;
  variant?: 'default' | 'table';
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  header = true,
  rows = 5,
  variant = 'default',
  className
}) => {
  return (
    <Card className={className}>
      {header && (
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
      )}
      <CardContent>
        {variant === 'table' ? (
          <div className="space-y-2">
            <div className="flex gap-4 pb-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {[...Array(rows)].map((_, i) => (
              <div key={i} className="flex gap-4 py-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(rows)].map((_, i) => (
              <Skeleton key={i} className={`h-4 w-${i % 2 ? 'full' : '3/4'}`} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
