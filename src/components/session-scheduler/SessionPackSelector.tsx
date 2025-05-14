
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSessionPacks } from '@/hooks/use-packs';
import { Skeleton } from '@/components/ui/skeleton';
import { FormControl, FormMessage } from '@/components/ui/form';

interface SessionPackSelectorProps {
  studentId?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const SessionPackSelector = ({ 
  studentId,
  value,
  onChange,
  error,
  disabled = false
}: SessionPackSelectorProps) => {
  const { packs, isLoading } = useSessionPacks(studentId);
  
  // Filter active packs with remaining sessions
  const availablePacks = packs.filter(
    pack => pack.is_active && pack.remaining_sessions > 0
  );
  
  // If the currently selected pack is no longer available, reset the selection
  useEffect(() => {
    if (!isLoading && value && availablePacks.length > 0) {
      const packStillAvailable = availablePacks.some(pack => pack.id === value);
      if (!packStillAvailable) {
        // Reset to first available pack or empty
        onChange(availablePacks.length > 0 ? availablePacks[0].id : '');
      }
    }
  }, [value, availablePacks, isLoading, onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="session-pack">Session Pack</Label>
      
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <FormControl>
          <Select
            disabled={disabled || availablePacks.length === 0}
            value={value}
            onValueChange={onChange}
          >
            <SelectTrigger id="session-pack">
              <SelectValue placeholder="Select a session pack" />
            </SelectTrigger>
            <SelectContent>
              {availablePacks.length === 0 ? (
                <SelectItem value="no-packs" disabled>
                  No active packs available
                </SelectItem>
              ) : (
                availablePacks.map((pack) => (
                  <SelectItem key={pack.id} value={pack.id}>
                    {pack.subject} ({pack.session_type}) - {pack.remaining_sessions} sessions left
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FormControl>
      )}
      
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
};

export default SessionPackSelector;
