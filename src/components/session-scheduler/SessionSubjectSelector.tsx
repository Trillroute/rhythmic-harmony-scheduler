
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubjectType } from "@/lib/types";

interface SessionSubjectSelectorProps {
  selectedSubject: SubjectType | "";
  onSelectSubject: (subject: SubjectType) => void;
}

export const SessionSubjectSelector: React.FC<SessionSubjectSelectorProps> = ({
  selectedSubject,
  onSelectSubject,
}) => {
  const subjectOptions: SubjectType[] = ['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal'];

  return (
    <div>
      <Label htmlFor="subject">Subject</Label>
      <Select 
        value={selectedSubject} 
        onValueChange={(value) => onSelectSubject(value as SubjectType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Subjects</SelectLabel>
            {subjectOptions.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
