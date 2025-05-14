
import React from "react";
import { Student } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { assertSubjectTypeArray } from "@/lib/type-utils";
import { UserIcon, MusicIcon, CalendarIcon } from "lucide-react";

interface StudentOverviewTabProps {
  student: Student & {
    createdAt?: Date;
    assignedTeacherName?: string;
    activePacks?: number;
    enrolledCourses?: string[];
    isActive?: boolean;
  };
}

export const StudentOverviewTab: React.FC<StudentOverviewTabProps> = ({ student }) => {
  const subjects = student.preferredSubjects 
    ? assertSubjectTypeArray(student.preferredSubjects) 
    : [];
  
  const createdAtStr = student.createdAt && student.createdAt instanceof Date
    ? format(student.createdAt, 'PPP')
    : 'Unknown';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium">Name</div>
            <div>{student.name}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Email</div>
            <div>{student.email}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Registered On</div>
            <div>{createdAtStr}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Music Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium">Preferred Subjects</div>
            {subjects.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {subjects.map((subject) => (
                  <Badge key={subject} variant="outline">{subject}</Badge>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No preferred subjects</div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium">Assigned Teacher</div>
            <div>
              {student.assignedTeacherName || (
                <span className="text-muted-foreground">Not assigned</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Packs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Active Packs</div>
            <Badge>{student.activePacks || 0}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {student.notes ? (
            <div className="whitespace-pre-wrap">{student.notes}</div>
          ) : (
            <div className="text-muted-foreground">No notes available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
