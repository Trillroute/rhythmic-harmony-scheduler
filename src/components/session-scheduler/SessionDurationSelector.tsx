
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SessionDurationSelectorProps {
  selectedDuration: string;
  onSelectDuration: (duration: string) => void;
}

export const SessionDurationSelector: React.FC<SessionDurationSelectorProps> = ({
  selectedDuration,
  onSelectDuration,
}) => {
  return (
    <div>
      <Label htmlFor="duration">Duration (minutes)</Label>
      <Select value={selectedDuration} onValueChange={onSelectDuration}>
        <SelectTrigger>
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Durations</SelectLabel>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
