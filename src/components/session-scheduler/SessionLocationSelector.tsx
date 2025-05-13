
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SessionLocationSelectorProps {
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
}

export const SessionLocationSelector: React.FC<SessionLocationSelectorProps> = ({
  selectedLocation,
  onSelectLocation,
}) => {
  return (
    <div>
      <Label htmlFor="location">Location</Label>
      <Select value={selectedLocation} onValueChange={onSelectLocation}>
        <SelectTrigger>
          <SelectValue placeholder="Select a location" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Locations</SelectLabel>
            <SelectItem value="Studio A">Studio A</SelectItem>
            <SelectItem value="Studio B">Studio B</SelectItem>
            <SelectItem value="Online">Online</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
