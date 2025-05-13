import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@radix-ui/react-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast"
import { useTeachers } from "@/hooks/use-teachers";
import { usePacks } from "@/hooks/use-packs";
import { useStudents } from "@/hooks/use-students";
import {
  SubjectType,
  SessionType,
  LocationType,
  AttendanceStatus
} from "@/lib/types";
import { useCreateSession } from "@/hooks/use-sessions";
import { useSessions } from "@/hooks/use-sessions";
import { Checkbox } from "@/components/ui/checkbox"

interface SessionSchedulerProps {
  onSuccess?: (data: any) => void;
}

const SessionScheduler: React.FC<SessionSchedulerProps> = ({ onSuccess }) => {
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

  const { teachers, isLoading: isLoadingTeachers } = useTeachers();
  const { packs, isLoading: isLoadingPacks } = usePacks();
  const { students, isLoading: isLoadingStudents } = useStudents();
  const { createSession, isPending: isPendingCreateSession } = useCreateSession();
  const { refetch: refetchSessions } = useSessions();

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
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare the session data with pack_id instead of packId
      const sessionData = {
        pack_id: selectedPack, // Use pack_id instead of packId
        teacher_id: selectedTeacher,
        subject: selectedSubject as SubjectType,
        session_type: selectedSessionType as SessionType,
        location: selectedLocation as LocationType,
        date_time: sessionDate,
        duration: Number(selectedDuration),
        notes: sessionNotes || '',
        studentIds: selectedStudents
      };
      
      const result = await createSession(sessionData);
      
      resetForm();
      onSuccess?.(result);
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPendingCreateSession) return;
    
    // Validate date is in the future
    if (sessionDate && new Date(sessionDate) < new Date()) {
      toast.error("Session date must be in the future");
      return;
    }
    
    // Check for required fields
    if (!selectedTeacher || !selectedSubject || !selectedSessionType || 
        !selectedLocation || !sessionDate || !selectedDuration) {
      toast.error("Please fill in all required fields");
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
          <div>
            <Label htmlFor="pack">Pack</Label>
            <Select value={selectedPack} onValueChange={setSelectedPack}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pack" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Packs</SelectLabel>
                  {isLoadingPacks ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    packs?.map((pack) => (
                      <SelectItem key={pack.id} value={pack.id}>
                        {pack.name}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="teacher">Teacher</Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
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
                        {teacher.profiles?.name}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Subjects</SelectLabel>
                  <SelectItem value="Guitar">Guitar</SelectItem>
                  <SelectItem value="Piano">Piano</SelectItem>
                  <SelectItem value="Drums">Drums</SelectItem>
                  <SelectItem value="Ukulele">Ukulele</SelectItem>
                  <SelectItem value="Vocal">Vocal</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sessionType">Session Type</Label>
            <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Session Types</SelectLabel>
                  <SelectItem value="Solo">Solo</SelectItem>
                  <SelectItem value="Duo">Duo</SelectItem>
                  <SelectItem value="Focus">Focus</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Locations</SelectLabel>
                  <SelectItem value="Studio A">Studio A</SelectItem>
                  <SelectItem value="Studio B">Studio B</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !sessionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sessionDate ? format(sessionDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={sessionDate}
                  onSelect={setSessionDate}
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Durations</SelectLabel>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              type="text"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>
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
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter((id) => id !== student.id));
                        }
                      }}
                    />
                    <Label htmlFor={`student-${student.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {student.profiles?.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Schedule Session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SessionScheduler;
