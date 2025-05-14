
import React, { useState } from "react";
import { useStudent } from "@/hooks/use-students";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  BookOpenIcon,
  CreditCardIcon,
  MessageSquareIcon,
  UserIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { StudentOverviewTab } from "./student-tabs/StudentOverviewTab";
import { StudentAttendanceTab } from "./student-tabs/StudentAttendanceTab";
import { StudentCoursesTab } from "./student-tabs/StudentCoursesTab";
import { StudentInvoicesTab } from "./student-tabs/StudentInvoicesTab";
import { StudentFeedbackTab } from "./student-tabs/StudentFeedbackTab";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const StudentProfile = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { data: student, isLoading, error } = useStudent(studentId);
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <SkeletonCard rows={8} />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6 rounded-lg bg-destructive/10 flex flex-col items-center justify-center">
        <AlertTriangleIcon className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Student Profile</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Student not found"}
        </p>
      </div>
    );
  }

  // Provide default values for potentially missing properties
  const enhancedStudent = {
    ...student,
    isActive: student.status !== 'inactive' // Map status to isActive boolean
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{enhancedStudent.name}</h1>
            <p className="text-muted-foreground">{enhancedStudent.email}</p>
          </div>
          <Badge variant={enhancedStudent.isActive ? "default" : "destructive"}>
            {enhancedStudent.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpenIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquareIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ErrorBoundary>
              <StudentOverviewTab student={enhancedStudent} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <ErrorBoundary>
              <StudentAttendanceTab studentId={student.id} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <ErrorBoundary>
              <StudentCoursesTab studentId={student.id} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <ErrorBoundary>
              <StudentInvoicesTab studentId={student.id} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <ErrorBoundary>
              <StudentFeedbackTab studentId={student.id} />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

export default StudentProfile;
