
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, CalendarCheck, Filter } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, startOfDay, endOfDay, isAfter } from 'date-fns';
import { AttendanceStatus, SubjectType, SessionType } from '@/lib/types';
import { useSessions, useUpdateSessionStatus, useRescheduleSession } from '@/hooks/use-sessions';
import { useToast } from '@/hooks/use-toast';

interface AttendanceTrackerProps {
  teacherId: string;
}

const AttendanceTracker = ({ teacherId }: AttendanceTrackerProps) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showFilters, setShowFilters] = useState(false);
  const [rescheduleMode, setRescheduleMode] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState<string>('');
  
  // Filters
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  // Construct filter object for the query
  const filterOptions = {
    teachers: teacherId ? [teacherId] : undefined,
    subjects: subjectFilter ? [subjectFilter as SubjectType] : undefined,
    sessionTypes: typeFilter ? [typeFilter as SessionType] : undefined,
    status: statusFilter ? [statusFilter as AttendanceStatus] : undefined,
    startDate: dateFilter ? startOfDay(dateFilter) : undefined,
    endDate: dateFilter ? endOfDay(dateFilter) : undefined,
  };
  
  // Fetch sessions with filters
  const { data: sessions, isLoading, error, isError } = useSessions(filterOptions);
  
  // Mutations
  const updateStatusMutation = useUpdateSessionStatus();
  const rescheduleMutation = useRescheduleSession();
  
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
  
  // Filter sessions based on current filter
  const filteredSessions = sessions?.filter(session => {
    const sessionDate = new Date(session.dateTime);
    const today = new Date();
    
    if (filter === 'upcoming') {
      return isAfter(sessionDate, today) && session.status === 'Scheduled';
    } else if (filter === 'past') {
      return !isAfter(sessionDate, today) || session.status !== 'Scheduled';
    } else {
      return true;
    }
  }) || [];
  
  // Sort sessions by date (newest first for past, oldest first for upcoming)
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (filter === 'past') {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    } else {
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    }
  });
  
  const updateAttendance = (sessionId: string, status: AttendanceStatus) => {
    updateStatusMutation.mutate({ sessionId, status });
  };
  
  const startReschedule = (sessionId: string) => {
    setRescheduleMode(sessionId);
    setNewDate(undefined);
    setNewTime('');
  };
  
  const cancelReschedule = () => {
    setRescheduleMode(null);
    setNewDate(undefined);
    setNewTime('');
  };
  
  const submitReschedule = () => {
    if (!rescheduleMode || !newDate || !newTime) {
      toast({
        title: "Missing Information",
        description: "Please select a new date and time.",
        variant: "destructive",
      });
      return;
    }
    
    const [hours, minutes] = newTime.split(':').map(Number);
    const rescheduleDateTime = new Date(newDate);
    rescheduleDateTime.setHours(hours, minutes, 0, 0);
    
    // Check if the new date is in the past
    if (rescheduleDateTime <= new Date()) {
      toast({
        title: "Invalid Date",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }
    
    rescheduleMutation.mutate({
      sessionId: rescheduleMode,
      newDateTime: rescheduleDateTime,
      reason: "Rescheduled by teacher"
    }, {
      onSuccess: () => {
        setRescheduleMode(null);
        setNewDate(undefined);
        setNewTime('');
      }
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Tracker</h2>
          <p className="text-muted-foreground">Loading sessions...</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-24">
              <div className="animate-pulse h-8 w-48 bg-muted rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Tracker</h2>
          <p className="text-destructive">Error loading sessions: {(error as Error)?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Tracker</h2>
          <p className="text-muted-foreground">Mark attendance for your sessions</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={filter === 'upcoming' ? 'default' : 'outline'} 
            onClick={() => setFilter('upcoming')}
            size="sm"
          >
            Upcoming
          </Button>
          <Button 
            variant={filter === 'past' ? 'default' : 'outline'} 
            onClick={() => setFilter('past')}
            size="sm"
          >
            Past
          </Button>
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {showFilters ? 'Hide' : 'Filter'}
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Label htmlFor="statusFilter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="statusFilter">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Cancelled by Student">Cancelled by Student</SelectItem>
                    <SelectItem value="Cancelled by Teacher">Cancelled by Teacher</SelectItem>
                    <SelectItem value="Cancelled by School">Cancelled by School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFilter">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dateFilter"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setDateFilter(undefined)}
                      >
                        Clear date filter
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4">
        {sortedSessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No {filter} sessions found.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedSessions.map(session => {
            const sessionDate = new Date(session.dateTime);
            const isPastSession = sessionDate < new Date();
            const canReschedule = session.status === 'Cancelled by Student' && session.rescheduleCount === 0;
            const isRescheduling = rescheduleMode === session.id;
            
            return (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <div className="flex items-center">
                      <span>{session.subject} - {session.sessionType}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({session.location})
                      </span>
                    </div>
                    {session.status !== 'Scheduled' && (
                      <div 
                        className={`px-2 py-1 text-xs rounded-full ${
                          session.status === 'Present' ? 'bg-green-100 text-green-800' :
                          session.status === 'Cancelled by Student' ? 'bg-red-100 text-red-800' :
                          session.status === 'Cancelled by Teacher' ? 'bg-orange-100 text-orange-800' :
                          session.status === 'Cancelled by School' ? 'bg-gray-100 text-gray-800' :
                          ''
                        }`}
                      >
                        {session.status}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {isRescheduling ? (
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Reschedule Session</div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reschedule-date">New Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="reschedule-date"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarCheck className="mr-2 h-4 w-4" />
                                {newDate ? format(newDate, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newDate}
                                onSelect={setNewDate}
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
                          <Label htmlFor="reschedule-time">New Time</Label>
                          <Select
                            value={newTime}
                            onValueChange={setNewTime}
                          >
                            <SelectTrigger id="reschedule-time">
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
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={submitReschedule}
                          disabled={!newDate || !newTime || rescheduleMutation.isPending}
                          className="flex-1"
                        >
                          {rescheduleMutation.isPending ? 'Submitting...' : 'Confirm Reschedule'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelReschedule}
                          disabled={rescheduleMutation.isPending}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                      
                      {rescheduleMutation.isError && (
                        <p className="text-sm text-destructive">
                          Error: {(rescheduleMutation.error as Error).message || 'Failed to reschedule session'}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Date & Time</div>
                          <div className="font-medium">
                            {format(sessionDate, 'PPP')} at {format(sessionDate, 'p')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Duration</div>
                          <div className="font-medium">{session.duration} minutes</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Students</div>
                          <div className="font-medium">{session.teacherName || 'Unknown Teacher'}</div>
                        </div>
                        {session.rescheduleCount > 0 && (
                          <div>
                            <div className="text-sm text-muted-foreground">Rescheduled</div>
                            <div className="font-medium">{session.rescheduleCount} time(s)</div>
                          </div>
                        )}
                      </div>
                      
                      {session.status === 'Scheduled' && (
                        <div className="flex gap-2 pt-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-500 text-white hover:bg-green-600"
                            onClick={() => updateAttendance(session.id, 'Present')}
                            disabled={!isPastSession || updateStatusMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Present
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => updateAttendance(session.id, 'Cancelled by Student')}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Student Cancelled
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-orange-500 text-white hover:bg-orange-600"
                            onClick={() => updateAttendance(session.id, 'Cancelled by Teacher')}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Teacher Cancelled
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAttendance(session.id, 'Cancelled by School')}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            School Cancelled
                          </Button>
                        </div>
                      )}
                      
                      {canReschedule && (
                        <div className="flex justify-end pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startReschedule(session.id)}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Reschedule
                          </Button>
                        </div>
                      )}
                      
                      {session.status === 'Cancelled by Student' && session.rescheduleCount > 0 && (
                        <div className="text-sm text-amber-600 flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4" />
                          This session has already been rescheduled once and cannot be rescheduled again.
                        </div>
                      )}
                    </>
                  )}
                  
                  {updateStatusMutation.isError && (
                    <p className="text-sm text-destructive">
                      Error: {(updateStatusMutation.error as Error).message || 'Failed to update attendance'}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
