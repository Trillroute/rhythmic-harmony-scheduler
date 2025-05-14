
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SessionRecurrenceSelectorProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  recurrenceCount: number;
  setRecurrenceCount: (count: number) => void;
}

export const SessionRecurrenceSelector: React.FC<SessionRecurrenceSelectorProps> = ({
  enabled,
  setEnabled,
  recurrenceCount,
  setRecurrenceCount,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="recurrence" className="flex-shrink-0">Recurring Session</Label>
        <Select 
          value={enabled ? "recurring" : "single"} 
          onValueChange={(value) => setEnabled(value === "recurring")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select session type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Session frequency</SelectLabel>
              <SelectItem value="single">Single session</SelectItem>
              <SelectItem value="recurring">Weekly recurring</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {enabled && (
        <div className={cn("flex items-center gap-2", !enabled && "opacity-50")}>
          <Label htmlFor="recurrenceCount" className="flex-shrink-0">Number of sessions:</Label>
          <Input
            id="recurrenceCount"
            type="number"
            min="2"
            max="12"
            value={recurrenceCount}
            onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 2)}
            className="w-24"
            disabled={!enabled}
          />
          <span className="text-sm text-muted-foreground">
            (Weekly for {recurrenceCount} weeks)
          </span>
        </div>
      )}
    </div>
  );
};
