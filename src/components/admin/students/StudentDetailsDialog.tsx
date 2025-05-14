
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudentDetail } from '@/hooks/use-students-management';
import { assertSubjectTypeArray } from '@/lib/type-utils';

interface StudentDetailsDialogProps {
  student: StudentDetail;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const StudentDetailsDialog: React.FC<StudentDetailsDialogProps> = ({
  student,
  open,
  onClose,
  onEdit
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about this student
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{student.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{student.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={student.isActive ? "success" : "destructive"}>
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-base">
                  {student.createdAt instanceof Date 
                    ? student.createdAt.toLocaleDateString() 
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Study Preferences */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Study Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preferred Subjects</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {student.preferredSubjects && assertSubjectTypeArray(student.preferredSubjects).length > 0 ? (
                    assertSubjectTypeArray(student.preferredSubjects).map(subject => (
                      <Badge key={subject} variant="outline">{subject}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None specified</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Teacher</p>
                <p className="text-base">{student.assignedTeacherName || "Not assigned"}</p>
              </div>
            </div>
          </div>

          {/* Learning & Progress */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Learning & Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Packs</p>
                <p className="text-base">{student.activePacks || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                    student.enrolledCourses.map(course => (
                      <Badge key={course} variant="outline">{course}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No courses</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="text-base p-3 bg-secondary rounded-md">
              {student.notes || "No notes available for this student."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>
            Edit Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
