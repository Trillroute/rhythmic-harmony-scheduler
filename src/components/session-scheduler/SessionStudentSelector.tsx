
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useStudents } from "@/hooks/use-students";

interface SessionStudentSelectorProps {
  selectedStudents: string[];
  onSelectStudents: (students: string[]) => void;
}

export const SessionStudentSelector: React.FC<SessionStudentSelectorProps> = ({
  selectedStudents,
  onSelectStudents,
}) => {
  const studentsQuery = useStudents();
  const students = studentsQuery.data || [];
  const isLoadingStudents = studentsQuery.isLoading;

  const handleStudentSelection = (checked: boolean | "indeterminate", studentId: string) => {
    if (checked) {
      onSelectStudents([...selectedStudents, studentId]);
    } else {
      onSelectStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  return (
    <div>
      <Label>Students</Label>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
        {isLoadingStudents ? (
          <div>Loading...</div>
        ) : (
          students?.map((student) => (
            <div key={student.id} className="flex items-center space-x-2">
              <Checkbox
                id={`student-${student.id}`}
                checked={selectedStudents.includes(student.id)}
                onCheckedChange={(checked) => handleStudentSelection(checked, student.id)}
              />
              <Label htmlFor={`student-${student.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {student.name}
              </Label>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
