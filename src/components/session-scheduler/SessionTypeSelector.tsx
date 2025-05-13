
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SessionTypeSelectorProps {
  selectedSessionType: string;
  onSelectSessionType: (type: string) => void;
}

export const SessionTypeSelector: React.FC<SessionTypeSelectorProps> = ({
  selectedSessionType,
  onSelectSessionType,
}) => {
  return (
    <div>
      <Label htmlFor="sessionType">Session Type</Label>
      <Select value={selectedSessionType} onValueChange={onSelectSessionType}>
        <SelectTrigger>
          <SelectValue placeholder="Select a session type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Session Types</SelectLabel>
            <SelectItem value="Solo">Solo</SelectItem>
            <SelectItem value="Duo">Duo</SelectItem>
            <SelectItem value="Focus">Focus</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
