
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SessionSubjectSelectorProps {
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
}

export const SessionSubjectSelector: React.FC<SessionSubjectSelectorProps> = ({
  selectedSubject,
  onSelectSubject,
}) => {
  return (
    <div>
      <Label htmlFor="subject">Subject</Label>
      <Select value={selectedSubject} onValueChange={onSelectSubject}>
        <SelectTrigger>
          <SelectValue placeholder="Select a subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Subjects</SelectLabel>
            <SelectItem value="Guitar">Guitar</SelectItem>
            <SelectItem value="Piano">Piano</SelectItem>
            <SelectItem value="Drums">Drums</SelectItem>
            <SelectItem value="Ukulele">Ukulele</SelectItem>
            <SelectItem value="Vocal">Vocal</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
