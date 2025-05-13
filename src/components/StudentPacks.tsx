import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  SubjectType, 
  SessionType, 
  LocationType,
  PackSize,
  WeeklyFrequency
} from '@/lib/types';
import { useSessionPacks, useCreateSessionPack, PackWithRelations } from '@/hooks/use-packs';
import { Filter } from 'lucide-react';

interface StudentPacksProps {
  studentId: string;
  onNewPack?: (packId: string) => void;
}

const StudentPacks = ({ studentId, onNewPack }: StudentPacksProps) => {
  const { toast } = useToast();
  const { data: sessionPacks, isLoading, error, isError } = useSessionPacks(studentId);
  const createPackMutation = useCreateSessionPack();
  
  // Form state for new pack
  const [newPackSubject, setNewPackSubject] = useState<SubjectType | ''>('');
  const [newPackType, setNewPackType] = useState<SessionType | ''>('');
  const [newPackLocation, setNewPackLocation] = useState<LocationType | ''>('');
  const [newPackSize, setNewPackSize] = useState<string>('');
  const [newPackFrequency, setNewPackFrequency] = useState<WeeklyFrequency>('once');
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('active'); // 'active', 'inactive', 'all'
  
  const subjectOptions: SubjectType[] = ['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal'];
  const sessionTypeOptions: SessionType[] = ['Solo', 'Duo', 'Focus'];
  const locationOptions: LocationType[] = ['Online', 'Offline'];
  const packSizeOptions: PackSize[] = [4, 10, 20, 30];
  const frequencyOptions: WeeklyFrequency[] = ['once', 'twice'];
  
  // Check if selected options are valid
  // Focus sessions can be online or offline, but Solo and Duo must be offline
  const isLocationValid = () => {
    if (newPackType === 'Focus') return true;
    if (newPackType === '' || newPackLocation === '') return true;
    return newPackLocation === 'Offline';
  };
  
  // Filter the packs based on user selections
  const filteredPacks = sessionPacks?.filter(pack => {
    // Filter by subject
    if (subjectFilter && pack.subject !== subjectFilter) return false;
    
    // Filter by active status
    if (statusFilter === 'active' && !pack.is_active) return false;
    if (statusFilter === 'inactive' && pack.is_active) return false;
    
    return true;
  }) || [];
  
  // Separate active and inactive packs
  const activePacks = filteredPacks.filter(pack => pack.is_active);
  const inactivePacks = filteredPacks.filter(pack => !pack.is_active);
  
  const handleCreatePack = () => {
    if (!newPackSubject || !newPackType || !newPackLocation || !newPackSize) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to create a new pack.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate location based on session type
    if (newPackType !== 'Focus' && newPackLocation === 'Online') {
      toast({
        title: "Invalid Location",
        description: `${newPackType} sessions can only be conducted offline.`,
        variant: "destructive",
      });
      return;
    }
    
    // Create new pack using the mutation
    createPackMutation.mutate({
      student_id: studentId,
      size: parseInt(newPackSize) as PackSize,
      subject: newPackSubject as SubjectType,
      session_type: newPackType as SessionType,
      location: newPackLocation as LocationType,
      purchased_date: new Date(),
      remaining_sessions: parseInt(newPackSize),
      is_active: true,
      weekly_frequency: newPackFrequency,
    }, {
      onSuccess: (data) => {
        // Call the callback if provided with the pack ID
        if (onNewPack && data.id) {
          onNewPack(data.id);
        }
        
        // Reset form
        setNewPackSubject('');
        setNewPackType('');
        setNewPackLocation('');
        setNewPackSize('');
        setNewPackFrequency('once');
      }
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Packs</h2>
          <p className="text-muted-foreground">Loading packs...</p>
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
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Packs</h2>
          <p className="text-destructive">Error loading packs: {(error as Error)?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Packs</h2>
          <p className="text-muted-foreground">Manage student session packs</p>
        </div>
        
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      {showFilters && (
        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectFilter">Subject</Label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger id="subjectFilter">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {subjectOptions.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="statusFilter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="statusFilter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="all">All</SelectItem>
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
            <CardTitle>Active Packs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active packs found
              </div>
            ) : (
              activePacks.map(pack => (
                <div 
                  key={pack.id} 
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{pack.subject}</h3>
                      <div className="text-sm text-muted-foreground">
                        {pack.session_type} - {pack.location}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Active
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm">
                      <span>Pack Size:</span>
                      <span className="font-medium">{pack.size} sessions</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining:</span>
                      <span className="font-medium">{pack.remaining_sessions} sessions</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Purchased:</span>
                      <span className="font-medium">{new Date(pack.purchased_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Frequency:</span>
                      <span className="font-medium">Weekly {pack.weekly_frequency}</span>
                    </div>
                    {pack.expiry_date && (
                      <div className="flex justify-between text-sm">
                        <span>Expires:</span>
                        <span className="font-medium">{new Date(pack.expiry_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Sessions
                    </Button>
                    {pack.remaining_sessions === 0 && (
                      <Button size="sm" className="flex-1">
                        Renew Pack
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Create New Pack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={newPackSubject}
                onValueChange={(value) => setNewPackSubject(value as SubjectType)}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionType">Session Type</Label>
              <Select
                value={newPackType}
                onValueChange={(value) => setNewPackType(value as SessionType)}
              >
                <SelectTrigger id="sessionType">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>
                      {type} ({type === 'Focus' ? '45 min' : '60 min'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={newPackLocation}
                onValueChange={(value) => setNewPackLocation(value as LocationType)}
              >
                <SelectTrigger id="location" className={!isLocationValid() ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map(location => (
                    <SelectItem 
                      key={location} 
                      value={location}
                      disabled={newPackType !== 'Focus' && location === 'Online'}
                    >
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isLocationValid() && (
                <p className="text-destructive text-xs">
                  {newPackType} sessions can only be conducted offline
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="packSize">Pack Size</Label>
              <Select
                value={newPackSize}
                onValueChange={setNewPackSize}
              >
                <SelectTrigger id="packSize">
                  <SelectValue placeholder="Select pack size" />
                </SelectTrigger>
                <SelectContent>
                  {packSizeOptions.map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} sessions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Weekly Frequency</Label>
              <Select
                value={newPackFrequency}
                onValueChange={(value) => setNewPackFrequency(value as WeeklyFrequency)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once a week</SelectItem>
                  <SelectItem value="twice">Twice a week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full mt-2" 
              onClick={handleCreatePack}
              disabled={!newPackSubject || !newPackType || !newPackLocation || !newPackSize || !isLocationValid() || createPackMutation.isPending}
            >
              {createPackMutation.isPending ? 'Creating...' : 'Create Pack'}
            </Button>
            
            {createPackMutation.isError && (
              <p className="text-destructive text-sm mt-2">
                Error: {(createPackMutation.error as Error)?.message || 'Failed to create pack'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pack History</CardTitle>
        </CardHeader>
        <CardContent>
          {inactivePacks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No pack history found
            </div>
          ) : (
            <div className="space-y-4">
              {inactivePacks.map(pack => (
                <div key={pack.id} className="flex items-center justify-between p-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{pack.subject} - {pack.session_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {pack.size} sessions, purchased {new Date(pack.purchased_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                    Completed
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPacks;
