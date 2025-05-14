
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SessionDatePicker } from "./SessionDatePicker";
import { SessionTeacherSelector } from "./SessionTeacherSelector";
import { SessionPackSelector } from "./SessionPackSelector";
import { SessionStudentSelector } from "./SessionStudentSelector";
import { SessionSubjectSelector } from "./SessionSubjectSelector";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { SessionLocationSelector } from "./SessionLocationSelector";
import { SessionRecurrenceSelector } from "./SessionRecurrenceSelector";
import { toast } from "sonner";
import { useSessions } from "@/hooks/use-sessions";
import { SubjectType, SessionType, LocationType } from "@/lib/types";

interface SessionFormProps {
  onSuccess?: (data: any) => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({ onSuccess }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedPack, setSelectedPack] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | "">("");
  const [selectedType, setSelectedType] = useState<SessionType | "">("");
  const [selectedLocation, setSelectedLocation] = useState<LocationType | "">("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceCount, setRecurrenceCount] = useState<number>(4);
  
  const { createBulkSessions, isPendingCreate } = useSessions();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeacher || !selectedPack || !selectedSubject || !selectedType || !selectedLocation || !selectedDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      // Prepare session data
      const sessionData = {
        teacherId: selectedTeacher,
        packId: selectedPack,
        subject: selectedSubject,
        sessionType: selectedType,
        location: selectedLocation,
        dateTime: selectedDate,
        duration: selectedType === "Focus" ? 45 : 60,
        notes: notes,
        studentIds: selectedStudents,
        recurrenceRule: isRecurring ? `FREQ=WEEKLY;COUNT=${recurrenceCount}` : undefined
      };
      
      // Create session(s)
      const data = await createBulkSessions([sessionData]);
      
      // Success notification
      const sessionText = isRecurring ? `${recurrenceCount} recurring sessions` : "session";
      toast.success(`${sessionText} scheduled successfully`);
      
      // Reset form
      setSelectedTeacher("");
      setSelectedPack("");
      setSelectedSubject("");
      setSelectedType("");
      setSelectedLocation("");
      setSelectedDate(undefined);
      setSelectedStudents([]);
      setNotes("");
      setIsRecurring(false);
      setRecurrenceCount(4);
      
      // Call onSuccess callback
      if (onSuccess && data) {
        onSuccess(data);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error(`Failed to schedule session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SessionTeacherSelector 
          selectedTeacher={selectedTeacher} 
          onSelectTeacher={setSelectedTeacher} 
        />
        
        <SessionPackSelector 
          selectedPack={selectedPack} 
          onSelectPack={setSelectedPack} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SessionSubjectSelector 
          selectedSubject={selectedSubject} 
          onSelectSubject={setSelectedSubject} 
        />
        
        <SessionTypeSelector 
          selectedType={selectedType} 
          onSelectType={setSelectedType} 
        />
        
        <SessionLocationSelector 
          selectedLocation={selectedLocation} 
          onSelectLocation={setSelectedLocation} 
          sessionType={selectedType}  
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <SessionDatePicker 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
        />
      </div>
      
      <SessionRecurrenceSelector
        enabled={isRecurring}
        setEnabled={setIsRecurring}
        recurrenceCount={recurrenceCount}
        setRecurrenceCount={setRecurrenceCount}
      />
      
      <SessionStudentSelector 
        selectedStudents={selectedStudents} 
        onSelectStudents={setSelectedStudents} 
      />
      
      <div>
        <Textarea 
          placeholder="Session notes (optional)" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none h-20"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isPendingCreate}>
        {isPendingCreate ? "Scheduling..." : `Schedule ${isRecurring ? 'Recurring Sessions' : 'Session'}`}
      </Button>
    </form>
  );
};
