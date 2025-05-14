
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StudentDetail } from '@/hooks/use-students-management';
import { SubjectType, Teacher } from '@/lib/types';
import { useTeachers } from '@/hooks/use-teachers';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { assertSubjectTypeArray } from '@/lib/type-utils';

interface StudentEditDialogProps {
  student: StudentDetail;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<StudentDetail> & { id: string }) => void;
  isPending: boolean;
}

export const StudentEditDialog: React.FC<StudentEditDialogProps> = ({
  student,
  open,
  onClose,
  onSave,
  isPending
}) => {
  // Form state
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [notes, setNotes] = useState(student.notes || '');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>(
    student.preferredSubjects ? assertSubjectTypeArray(student.preferredSubjects) : []
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(
    student.preferredTeachers && student.preferredTeachers.length > 0 
      ? student.preferredTeachers[0] 
      : undefined
  );
  
  // Load teachers for dropdown
  const { data: teachers = [] } = useTeachers();
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare updated data
    const updatedData: Partial<StudentDetail> & { id: string } = {
      id: student.id,
      name,
      email,
      notes,
      preferredSubjects: selectedSubjects,
      preferredTeachers: selectedTeacherId ? [selectedTeacherId] : []
    };
    
    onSave(updatedData);
  };

  // Handle subject selection
  const toggleSubject = (subject: SubjectType) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Student email"
                required
              />
            </div>
          </div>
          
          {/* Advanced Settings */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="preferences">
              <AccordionTrigger>Preferences & Settings</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Preferred Subjects</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal'] as SubjectType[]).map(subject => (
                        <Badge 
                          key={subject} 
                          variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => toggleSubject(subject)}
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assignedTeacher">Assigned Teacher</Label>
                    <Select 
                      value={selectedTeacherId} 
                      onValueChange={setSelectedTeacherId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Teachers</SelectLabel>
                          <SelectItem value="">None</SelectItem>
                          {teachers.map((teacher: Teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="notes">
              <AccordionTrigger>Notes</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="notes">Student Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any notes about this student"
                    rows={4}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
