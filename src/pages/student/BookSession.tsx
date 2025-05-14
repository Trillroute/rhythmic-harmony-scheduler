
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSessions } from '@/hooks/use-sessions';
import { useSessionPacks } from '@/hooks/use-packs';
import { useAuth } from '@/contexts/AuthContext';

const BookSession = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<string>('Online');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedPack, setSelectedPack] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState('');
  
  // Get student packs
  const { packs } = useSessionPacks(user?.id);
  const { createBulkSessions, isPendingCreate } = useSessions();
  
  // Mock data
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];
  
  const teachers = [
    { id: '1', name: 'John Smith', subjects: ['Guitar', 'Ukulele'] },
    { id: '2', name: 'Maria Rodriguez', subjects: ['Piano'] },
    { id: '3', name: 'David Lee', subjects: ['Drums', 'Guitar'] },
    { id: '4', name: 'Sarah Johnson', subjects: ['Vocal', 'Piano'] },
  ];
  
  // Filter teachers based on selected subject
  const filteredTeachers = selectedSubject 
    ? teachers.filter(teacher => teacher.subjects.includes(selectedSubject))
    : teachers;

  const availablePacks = packs.filter(pack => 
    pack.remaining_sessions > 0 && 
    pack.is_active && 
    (!selectedSubject || pack.subject === selectedSubject)
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot || !selectedTeacher || !selectedPack) {
      return;
    }
    
    // Create date and time object
    const [hour, minute] = selectedTimeSlot.split(':');
    const isPM = selectedTimeSlot.includes('PM');
    const hourNum = parseInt(hour) + (isPM && hour !== '12' ? 12 : 0);
    
    const sessionDateTime = new Date(selectedDate);
    sessionDateTime.setHours(hourNum);
    sessionDateTime.setMinutes(parseInt(minute) || 0);
    
    const selectedPackObj = packs.find(p => p.id === selectedPack);
    
    if (!selectedPackObj) {
      return;
    }
    
    try {
      await createBulkSessions({
        teacherId: selectedTeacher,
        packId: selectedPack,
        subject: selectedSubject as any,
        sessionType: selectedPackObj.session_type,
        location: selectedLocation as any,
        startDateTime: sessionDateTime,
        duration: 60, // Default to 60 minutes
        notes: sessionNotes,
        recurrenceRule: 'FREQ=ONCE',
        studentIds: [user?.id || '']
      });
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTimeSlot(undefined);
      setSessionNotes('');
      
    } catch (error) {
      console.error('Error booking session:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Book a Session</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>New Session</CardTitle>
                <CardDescription>Book a new session with one of our teachers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Select a Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Guitar">Guitar</SelectItem>
                        <SelectItem value="Piano">Piano</SelectItem>
                        <SelectItem value="Drums">Drums</SelectItem>
                        <SelectItem value="Vocal">Vocal</SelectItem>
                        <SelectItem value="Ukulele">Ukulele</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select a Teacher</Label>
                    <Select 
                      value={selectedTeacher} 
                      onValueChange={setSelectedTeacher}
                      disabled={!selectedSubject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedSubject ? "Select teacher" : "Select subject first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTeachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <RadioGroup 
                      value={selectedLocation} 
                      onValueChange={setSelectedLocation}
                      className="flex"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Online" id="online" />
                        <Label htmlFor="online">Online</Label>
                      </div>
                      <div className="flex items-center space-x-2 ml-6">
                        <RadioGroupItem value="Offline" id="offline" />
                        <Label htmlFor="offline">In-Person</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Session Pack</Label>
                    <Select 
                      value={selectedPack} 
                      onValueChange={setSelectedPack}
                      disabled={!selectedSubject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedSubject 
                            ? "Select subject first" 
                            : availablePacks.length === 0 
                              ? "No available packs" 
                              : "Select pack"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePacks.map(pack => (
                          <SelectItem key={pack.id} value={pack.id}>
                            {pack.subject} - {pack.session_type} ({pack.remaining_sessions} sessions left)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Date & Time</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => {
                        // Disable dates in the past and Sundays
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || date.getDay() === 0;
                      }}
                    />
                    
                    <div>
                      <Label className="mb-2 block">Available Time Slots</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={selectedTimeSlot === slot ? "default" : "outline"}
                            className="justify-center"
                            onClick={() => setSelectedTimeSlot(slot)}
                            disabled={!selectedDate}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes or special requests for this session"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={
                    !selectedDate || 
                    !selectedTimeSlot || 
                    !selectedTeacher || 
                    !selectedPack ||
                    isPendingCreate
                  }
                  className="w-full"
                >
                  {isPendingCreate ? "Booking..." : "Book Session"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Subject</p>
                <p className="text-sm">{selectedSubject || 'Not selected'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Teacher</p>
                <p className="text-sm">
                  {selectedTeacher 
                    ? teachers.find(t => t.id === selectedTeacher)?.name 
                    : 'Not selected'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-sm">
                  {selectedDate && selectedTimeSlot 
                    ? `${format(selectedDate, 'EEEE, MMMM d, yyyy')} at ${selectedTimeSlot}` 
                    : 'Not selected'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm">{selectedLocation}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Session Pack</p>
                <p className="text-sm">
                  {selectedPack 
                    ? availablePacks.find(p => p.id === selectedPack)?.subject + ' - ' +
                      availablePacks.find(p => p.id === selectedPack)?.session_type
                    : 'Not selected'}
                </p>
              </div>
              
              {selectedPack && (
                <div className="rounded-md bg-muted p-3 mt-4">
                  <p className="text-sm font-medium">
                    After this booking, you will have {" "}
                    {availablePacks.find(p => p.id === selectedPack)?.remaining_sessions - 1} 
                    {" "} sessions remaining in this pack.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookSession;
