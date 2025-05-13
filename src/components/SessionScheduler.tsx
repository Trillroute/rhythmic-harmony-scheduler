import React, { useState, useEffect } from 'react';
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
import { CalendarCheck, Search, Filter } from 'lucide-react';
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
import { useStudents } from '@/hooks/use-students';
import { useTeachers } from '@/hooks/use-teachers';
import { useSessionPacks } from '@/hooks/use-packs';
import { useSessions } from '@/hooks/use-sessions';

interface SessionSchedulerProps {
  onScheduleSession?: (session: Session) => void;
}

const SessionScheduler = ({ onScheduleSession }: SessionSchedulerProps) => {
  const { toast } = useToast();
  
  // Fetch data using React Query hooks
  const { data: students, isLoading: studentsLoading, error: studentsError } = useStudents();
  const { data: teachers, isLoading: teachersLoading, error: teachersError } = useTeachers();
  const { data: sessionPacks, isLoading: packsLoading, error: packsError } = useSessionPacks();
  const { createSessions, isPendingCreate } = useSessions();
  
  // Form state
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedPack, setSelectedPack] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Filters state
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Reset form when student selection changes
  useEffect(() => {
    setSelectedPack('');
    setSelectedTeacher('');
  }, [selectedStudent]);
  
  // Reset teacher when pack changes (since subject might change)
  useEffect(() => {
    setSelectedTeacher('');
  }, [selectedPack]);
  
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
  
  // Get available packs for selected student
  const availablePacks = selectedStudent && sessionPacks
    ? sessionPacks.filter(
        pack => pack.studentId === selectedStudent && pack.isActive && pack.remainingSessions > 0
      )
    : [];
    
  // Apply subject filter if set
  const filteredPacks = subjectFilter 
    ? availablePacks.filter(pack => pack.subject === subjectFilter)
    : availablePacks;
    
  // Apply session type filter if set
  const filteredByTypePacks = typeFilter
    ? filteredPacks.filter(pack => pack.sessionType === typeFilter)
    : filteredPacks;
    
  // Apply location filter if set
  const fullyFilteredPacks = locationFilter
    ? filteredByTypePacks.filter(pack => pack.location === locationFilter)
    : filteredByTypePacks;
  
  // Get selected pack details
  const pack = selectedPack && sessionPacks
    ? sessionPacks.find(p => p.id === selectedPack)
    : undefined;
  
  // Get available teachers based on subject
  const availableTeachers = pack && teachers
    ? teachers.filter(teacher => teacher.subjects.includes(pack.subject))
    : [];
  
  const handleScheduleSession = () => {
    if (!selectedStudent || !selectedPack || !selectedTeacher || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to schedule a session.",
        variant: "destructive",
      });
      return;
    }
    
    if (!pack) {
      toast({
        title: "Error",
        description: "Selected pack not found.",
        variant: "destructive",
      });
      return;
    }
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const sessionDateTime = new Date(selectedDate);
    sessionDateTime.setHours(hours, minutes, 0, 0);
    
    // Create the session using the mutation
    createSessions([{
      packId: selectedPack,
      teacherId: selectedTeacher,
      studentIds: [selectedStudent],
      subject: pack.subject,
      sessionType: pack.sessionType,
      location: pack.location,
      dateTime: sessionDateTime,
      duration: pack.sessionType === 'Focus' ? 45 : 60,
      status: 'Scheduled',
      notes: ''
    }], {
      onSuccess: (data) => {
        // Call the callback if provided
        if (onScheduleSession && data && data.length > 0) {
          const newSession: Session = {
            id: data[0].id,
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
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          onScheduleSession(newSession);
        }
        
        // Reset form
        setSelectedStudent('');
        setSelectedPack('');
        setSelectedTeacher('');
        setSelectedDate(undefined);
        setSelectedTime('');
      }
    });
  };

  // Loading states
  if (studentsLoading || teachersLoading || packsLoading) {
    return <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Session Scheduler</h2>
        <p className="text-muted-foreground">Loading data...</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="h-48 flex items-center justify-center">
              <div className="animate-pulse h-8 w-48 bg-muted rounded-md"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="h-48 flex items-center justify-center">
              <div className="animate-pulse h-8 w-48 bg-muted rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
  }
  
  // Error states
  if (studentsError || teachersError || packsError) {
    return <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Session Scheduler</h2>
        <p className="text-destructive">Error loading data. Please try again later.</p>
      </div>
    </div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Scheduler</h2>
          <p className="text-muted-foreground">Create and manage session schedules</p>
        </div>
        
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      {showFilters && (
        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectFilter">Subject</Label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger id="subjectFilter">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    <SelectItem value="Guitar">Guitar</SelectItem>
                    <SelectItem value="Piano">Piano</SelectItem>
                    <SelectItem value="Drums">Drums</SelectItem>
                    <SelectItem value="Ukulele">Ukulele</SelectItem>
                    <SelectItem value="Vocal">Vocal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="typeFilter">Session Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="typeFilter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Duo">Duo</SelectItem>
                    <SelectItem value="Focus">Focus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="locationFilter">Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger id="locationFilter">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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
                  {students?.map((student) => (
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
                disabled={!selectedStudent || fullyFilteredPacks.length === 0}
              >
                <SelectTrigger id="pack">
                  <SelectValue placeholder={
                    !selectedStudent 
                      ? "Select a student first" 
                      : fullyFilteredPacks.length === 0 
                        ? "No active packs available" 
                        : "Select a session pack"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {fullyFilteredPacks.map(pack => (
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
                      disabled={(date) => {
                        // Disable dates in the past
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
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
              disabled={!selectedStudent || !selectedPack || !selectedTeacher || !selectedDate || !selectedTime || isPendingCreate}
            >
              {isPendingCreate 
                ? 'Scheduling...' 
                : 'Schedule Session'}
            </Button>
            
            {isPendingCreate && (
              <p className="text-sm text-muted-foreground mt-2">
                Creating session...
              </p>
            )}
            
            {createSessions.isError && (
              <p className="text-sm text-destructive mt-2">
                {(createSessions.error as Error)?.message || 'Failed to schedule session'}
              </p>
            )}
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
                  <h3 className="font-medium">Frequency</h3>
                  <p>Weekly {pack.weeklyFrequency}</p>
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
