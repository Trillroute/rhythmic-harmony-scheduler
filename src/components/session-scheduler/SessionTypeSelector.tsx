
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SessionType } from "@/lib/types";

interface SessionTypeSelectorProps {
  selectedType: SessionType | "";
  onSelectType: (type: SessionType) => void;
}

export const SessionTypeSelector: React.FC<SessionTypeSelectorProps> = ({
  selectedType,
  onSelectType,
}) => {
  const typeOptions: SessionType[] = ['Solo', 'Duo', 'Focus'];

  return (
    <div>
      <Label htmlFor="sessionType">Session Type</Label>
      <Select 
        value={selectedType} 
        onValueChange={(value) => onSelectType(value as SessionType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Session Types</SelectLabel>
            {typeOptions.map((type) => (
              <SelectItem key={type} value={type}>
                {type} ({type === 'Focus' ? '45 min' : '60 min'})
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
