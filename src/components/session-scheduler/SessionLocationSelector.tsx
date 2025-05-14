
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationType, SessionType } from "@/lib/types";

interface SessionLocationSelectorProps {
  selectedLocation: LocationType | "";
  onSelectLocation: (location: LocationType) => void;
  sessionType: SessionType | "";
}

export const SessionLocationSelector: React.FC<SessionLocationSelectorProps> = ({
  selectedLocation,
  onSelectLocation,
  sessionType,
}) => {
  const locationOptions: LocationType[] = ['Online', 'Offline'];

  // Only Focus sessions can be done online
  const isOnlineDisabled = sessionType !== "" && sessionType !== "Focus";

  return (
    <div>
      <Label htmlFor="location">Location</Label>
      <Select 
        value={selectedLocation} 
        onValueChange={(value) => onSelectLocation(value as LocationType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Locations</SelectLabel>
            {locationOptions.map((location) => (
              <SelectItem 
                key={location} 
                value={location}
                disabled={location === 'Online' && isOnlineDisabled}
              >
                {location}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {selectedLocation === 'Online' && isOnlineDisabled && (
        <p className="text-sm text-destructive mt-1">
          Only Focus sessions can be conducted online
        </p>
      )}
    </div>
  );
};
