
import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSessionPacks } from '@/hooks/use-packs';
import { SessionPack } from '@/hooks/use-packs';
import { SubjectType } from '@/lib/types';

interface SessionPackSelectorProps {
  studentId: string;
  subject: SubjectType;
  onPackSelect: (packId: string) => void;
  value?: string;
}

export function SessionPackSelector({ studentId, subject, onPackSelect, value }: SessionPackSelectorProps) {
  // Get packs for the selected student
  const { packs } = useSessionPacks(studentId);
  
  // Filter packs by subject and availability
  const availablePacks = useMemo(() => {
    if (!packs.data || packs.isLoading) return [];
    
    return packs.data.filter(pack => 
      pack.subject === subject && 
      pack.is_active && 
      pack.remaining_sessions > 0
    );
  }, [packs.data, packs.isLoading, subject]);

  return (
    <div className="space-y-2">
      <Label htmlFor="pack">Session Pack</Label>
      <Select
        value={value || ''}
        onValueChange={onPackSelect}
        disabled={packs.isLoading || availablePacks.length === 0}
      >
        <SelectTrigger id="pack">
          <SelectValue placeholder={
            packs.isLoading 
              ? "Loading packs..." 
              : availablePacks.length === 0 
                ? "No packs available" 
                : "Select a session pack"
          } />
        </SelectTrigger>
        <SelectContent>
          {availablePacks.map((pack: SessionPack) => (
            <SelectItem key={pack.id} value={pack.id}>
              {pack.subject} ({pack.size}) - {pack.remaining_sessions} sessions left
            </SelectItem>
          ))}
          {!packs.isLoading && availablePacks.length === 0 && (
            <SelectItem value="none" disabled>No available packs for this subject</SelectItem>
          )}
        </SelectContent>
      </Select>
      {availablePacks.length === 0 && !packs.isLoading && (
        <p className="text-sm text-muted-foreground">
          No active packs available for {subject}. Please purchase a new pack.
        </p>
      )}
    </div>
  );
}
