
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeachers } from "@/hooks/use-teachers";

interface SessionTeacherSelectorProps {
  selectedTeacher: string;
  onSelectTeacher: (teacherId: string) => void;
}

export const SessionTeacherSelector: React.FC<SessionTeacherSelectorProps> = ({
  selectedTeacher,
  onSelectTeacher,
}) => {
  const teachersQuery = useTeachers();
  const teachers = teachersQuery.data || [];
  const isLoadingTeachers = teachersQuery.isLoading;

  return (
    <div>
      <Label htmlFor="teacher">Teacher</Label>
      <Select value={selectedTeacher} onValueChange={onSelectTeacher}>
        <SelectTrigger>
          <SelectValue placeholder="Select a teacher" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Teachers</SelectLabel>
            {isLoadingTeachers ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
              teachers?.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
