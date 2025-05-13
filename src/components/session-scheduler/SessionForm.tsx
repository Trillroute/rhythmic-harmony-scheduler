
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SubjectType, SessionType, LocationType } from "@/lib/types";
import { useSessions } from "@/hooks/use-sessions";
import { SessionDatePicker } from "./SessionDatePicker";
import { SessionTeacherSelector } from "./SessionTeacherSelector";
import { SessionPackSelector } from "./SessionPackSelector";
import { SessionSubjectSelector } from "./SessionSubjectSelector";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { SessionLocationSelector } from "./SessionLocationSelector";
import { SessionDurationSelector } from "./SessionDurationSelector";
import { SessionStudentSelector } from "./SessionStudentSelector";

interface SessionFormProps {
  onSuccess?: (data: any) => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({ onSuccess }) => {
  const [selectedPack, setSelectedPack] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<Date | undefined>();
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  
  const { createBulkSessions, refetchSessions } = useSessions();

  const resetForm = () => {
    setSelectedPack("");
    setSelectedTeacher("");
    setSelectedSubject("");
    setSelectedSessionType("");
    setSelectedLocation("");
    setSessionDate(undefined);
    setSelectedDuration("");
    setSessionNotes("");
    setSelectedStudents([]);
  };

  const handleCreateSession = async () => {
    if (!selectedTeacher || !selectedSubject || !selectedSessionType || 
        !selectedLocation || !sessionDate || !selectedDuration) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare the session data
      const sessionData = {
        packId: selectedPack,
        teacherId: selectedTeacher,
        subject: selectedSubject as SubjectType,
        sessionType: selectedSessionType as SessionType,
        location: selectedLocation as LocationType,
        dateTime: sessionDate,
        duration: Number(selectedDuration),
        notes: sessionNotes || '',
        studentIds: selectedStudents
      };
      
      const result = await createBulkSessions([sessionData]);
      
      toast({
        title: "Success",
        description: "Session created successfully"
      });
      
      resetForm();
      onSuccess?.(result);
      refetchSessions();
    } catch (error) {
      console.error("Failed to create session:", error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date is in the future
    if (sessionDate && new Date(sessionDate) < new Date()) {
      toast({
        title: "Invalid date",
        description: "Session date must be in the future",
        variant: "destructive"
      });
      return;
    }
    
    // Check for required fields
    if (!selectedTeacher || !selectedSubject || !selectedSessionType || 
        !selectedLocation || !sessionDate || !selectedDuration) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    handleCreateSession();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Session</CardTitle>
        <CardDescription>Create a new session for a student.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <SessionPackSelector
            selectedPack={selectedPack}
            onSelectPack={setSelectedPack}
          />
          
          <SessionTeacherSelector
            selectedTeacher={selectedTeacher}
            onSelectTeacher={setSelectedTeacher}
          />
          
          <SessionSubjectSelector
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
          />
          
          <SessionTypeSelector
            selectedSessionType={selectedSessionType}
            onSelectSessionType={setSelectedSessionType}
          />
          
          <SessionLocationSelector
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
          />
          
          <SessionDatePicker
            sessionDate={sessionDate}
            onSelectDate={setSessionDate}
          />
          
          <SessionDurationSelector
            selectedDuration={selectedDuration}
            onSelectDuration={setSelectedDuration}
          />
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              type="text"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>
          
          <SessionStudentSelector
            selectedStudents={selectedStudents}
            onSelectStudents={setSelectedStudents}
          />
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Schedule Session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
