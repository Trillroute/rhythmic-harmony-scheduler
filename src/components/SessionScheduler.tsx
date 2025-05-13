
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { CalendarCheck, Search } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { 
  SubjectType, 
  Teacher, 
  SessionType, 
  LocationType, 
  Student, 
  Session, 
  SessionPack 
} from '@/lib/types';
import { teachers, students, sessionPacks } from '@/lib/data';

interface SessionSchedulerProps {
  onScheduleSession?: (session: Session) => void;
}

const SessionScheduler = ({ onScheduleSession }: SessionSchedulerProps) => {
  const { toast } = useToast();
  
  // Form state
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedPack, setSelectedPack] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Get available packs for selected student
  const availablePacks = selectedStudent
    ? sessionPacks.filter(
        pack => pack.studentId === selectedStudent && pack.isActive && pack.remainingSessions > 0
      )
    : [];
  
  // Get selected pack details
  const pack = selectedPack
    ? sessionPacks.find(p => p.id === selectedPack)
    : undefined;
  
  // Get available teachers based on subject
  const availableTeachers = pack
    ? teachers.filter(teacher => teacher.subjects.includes(pack.subject))
    : [];
  
  // Generate time slots (9AM to 7PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 19; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      slots.push(`${formattedHour}:00`);
      if (hour < 19) {
        slots.push(`${formattedHour}:30`);
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  const handleScheduleSession = () => {
    if (!selectedStudent || !selectedPack || !selectedTeacher || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to schedule a session.",
        variant: "destructive",
      });
      return;
    }
    
    const pack = sessionPacks.find(p => p.id === selectedPack);
    if (!pack) return;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const sessionDateTime = new Date(selectedDate);
    sessionDateTime.setHours(hours, minutes, 0, 0);
    
    // Create the session
    const newSession: Session = {
      id: `session_${Date.now()}`,
      packId: selectedPack,
      teacherId: selectedTeacher,
      studentIds: [selectedStudent],
      subject: pack.subject,
      sessionType: pack.sessionType,
      location: pack.location,
      dateTime: sessionDateTime,
      duration: pack.sessionType === 'Focus' ? 45 : 60,
      status: 'Scheduled',
      rescheduleCount: 0,
    };
    
    // If it's a Duo session, we'd need to add another student
    // (simplified here - in a real app, we would handle this)
    
    // Call the callback if provided
    if (onScheduleSession) {
      onScheduleSession(newSession);
    }
    
    toast({
      title: "Session Scheduled",
      description: `${pack.subject} session scheduled for ${format(sessionDateTime, 'PPP')} at ${format(sessionDateTime, 'p')}`,
    });
    
    // Reset form
    setSelectedStudent('');
    setSelectedPack('');
    setSelectedTeacher('');
    setSelectedDate(undefined);
    setSelectedTime('');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Session Scheduler</h2>
        <p className="text-muted-foreground">Create and manage session schedules</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pack">Session Pack</Label>
              <Select
                value={selectedPack}
                onValueChange={setSelectedPack}
                disabled={!selectedStudent || availablePacks.length === 0}
              >
                <SelectTrigger id="pack">
                  <SelectValue placeholder={
                    !selectedStudent 
                      ? "Select a student first" 
                      : availablePacks.length === 0 
                        ? "No active packs available" 
                        : "Select a session pack"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availablePacks.map(pack => (
                    <SelectItem key={pack.id} value={pack.id}>
                      {pack.subject} - {pack.sessionType} ({pack.remainingSessions} remaining)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Select
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
                disabled={!pack || availableTeachers.length === 0}
              >
                <SelectTrigger id="teacher">
                  <SelectValue placeholder={
                    !pack 
                      ? "Select a pack first" 
                      : availableTeachers.length === 0 
                        ? "No teachers available for this subject" 
                        : "Select a teacher"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select
                  value={selectedTime}
                  onValueChange={setSelectedTime}
                >
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              className="w-full mt-2" 
              onClick={handleScheduleSession}
              disabled={!selectedStudent || !selectedPack || !selectedTeacher || !selectedDate || !selectedTime}
            >
              Schedule Session
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!pack ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                <div className="text-center">
                  <CalendarCheck className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>Select a student and pack to view session details</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="font-medium">Session Type</h3>
                  <div className="flex gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      pack.sessionType === 'Focus' ? 'bg-music-purple/10 text-music-purple' :
                      pack.sessionType === 'Solo' ? 'bg-music-blue/10 text-music-blue' :
                      'bg-music-cyan/10 text-music-cyan'
                    }`}>
                      {pack.sessionType}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      pack.location === 'Online' ? 'bg-music-green/10 text-music-green' :
                      'bg-music-orange/10 text-music-orange'
                    }`}>
                      {pack.location}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Session Subject</h3>
                  <p>{pack.subject}</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Duration</h3>
                  <p>{pack.sessionType === 'Focus' ? '45 minutes' : '60 minutes'}</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Pack Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted p-2 rounded">
                      <div className="text-sm text-muted-foreground">Total Sessions</div>
                      <div className="font-medium">{pack.size}</div>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <div className="text-sm text-muted-foreground">Remaining</div>
                      <div className="font-medium">{pack.remainingSessions}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Scheduling Rules</h3>
                  <ul className="list-disc pl-5 text-sm">
                    <li>
                      {pack.sessionType === 'Focus' 
                        ? 'Focus sessions are 45 minutes (1-on-1)'
                        : pack.sessionType === 'Solo' 
                          ? 'Solo sessions are 60 minutes (1-on-1)'
                          : 'Duo sessions are 60 minutes (2 students)'
                      }
                    </li>
                    <li>
                      {pack.location === 'Online'
                        ? 'Online sessions are conducted via video call'
                        : 'Offline sessions are in-person at the music school'
                      }
                    </li>
                    <li>Cancelled sessions can be rescheduled once</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionScheduler;
