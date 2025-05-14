
import React from "react";
import { useStudentEnrollments } from "@/hooks/use-student-enrollments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon, BookOpenIcon } from "lucide-react";
import { format } from "date-fns";

interface StudentCoursesTabProps {
  studentId: string;
}

export const StudentCoursesTab: React.FC<StudentCoursesTabProps> = ({ studentId }) => {
  const { enrollments, isLoading, error } = useStudentEnrollments(studentId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-destructive/10 flex flex-col items-center justify-center">
        <AlertTriangleIcon className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Course Enrollments</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Failed to load enrollment data"}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenIcon className="h-5 w-5" />
          Course Enrollments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {enrollments && enrollments.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.courseName}</TableCell>
                    <TableCell>{enrollment.startDate && format(new Date(enrollment.startDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          enrollment.status === "active"
                            ? "default"
                            : enrollment.status === "completed"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={enrollment.completionPercentage} className="h-2" />
                        <span className="text-xs w-10">{enrollment.completionPercentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center">
            <p className="text-muted-foreground">No course enrollments found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
