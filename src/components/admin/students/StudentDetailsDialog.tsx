
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { assertSubjectTypeArray } from '@/lib/type-utils';
import { StudentDetail } from '@/hooks/use-students-management';

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
  onEdit,
}) => {
  // Safely access student properties
  const subjects = student.preferredSubjects ? assertSubjectTypeArray(student.preferredSubjects) : [];
  const enrolledCourses = student.enrolledCourses || [];
  const activePacks = student.activePacks || 0;

  // Format dates safely
  const createdAtStr = student.createdAt ? format(new Date(student.createdAt), 'PPP') : 'Unknown';
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            View complete information about this student.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <h3 className="font-medium text-sm">Student Name</h3>
            <p className="text-sm">{student.name}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-medium text-sm">Email</h3>
            <p className="text-sm">{student.email}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-medium text-sm">Status</h3>
            <Badge variant={student.isActive ? "default" : "destructive"}>{student.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-medium text-sm">Registered On</h3>
            <p className="text-sm">{createdAtStr}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Preferred Subjects</h3>
            {subjects.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {subjects.map((subject) => (
                  <Badge key={subject} variant="outline">{subject}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No preferred subjects</p>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Assigned Teacher</h3>
            <p className="text-sm">{student.assignedTeacherName || 'Not assigned'}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Active Session Packs</h3>
            <Badge>{activePacks}</Badge>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Enrolled Courses</h3>
            {enrolledCourses.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {enrolledCourses.map((course) => (
                  <Badge key={course} variant="outline">{course}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not enrolled in any courses</p>
            )}
          </div>
          
          {student.notes && (
            <div className="space-y-1">
              <h3 className="font-medium text-sm">Notes</h3>
              <p className="text-sm whitespace-pre-wrap">{student.notes}</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onEdit}>Edit Details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
