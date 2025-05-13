
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
  SessionPack, 
  SubjectType, 
  SessionType, 
  LocationType,
  PackSize,
  WeeklyFrequency
} from '@/lib/types';
import { sessionPacks } from '@/lib/data';

interface StudentPacksProps {
  studentId: string;
  onNewPack?: (pack: SessionPack) => void;
}

const StudentPacks = ({ studentId, onNewPack }: StudentPacksProps) => {
  const { toast } = useToast();
  
  // Get student's packs
  const studentPacks = sessionPacks.filter(pack => pack.studentId === studentId);
  
  // Form state for new pack
  const [newPackSubject, setNewPackSubject] = useState<SubjectType | ''>('');
  const [newPackType, setNewPackType] = useState<SessionType | ''>('');
  const [newPackLocation, setNewPackLocation] = useState<LocationType | ''>('');
  const [newPackSize, setNewPackSize] = useState<string>('');
  const [newPackFrequency, setNewPackFrequency] = useState<WeeklyFrequency>('once');
  
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
    
    const now = new Date();
    
    // Create new pack
    const newPack: SessionPack = {
      id: `pack_${Date.now()}`,
      studentId,
      size: parseInt(newPackSize) as PackSize,
      subject: newPackSubject as SubjectType,
      sessionType: newPackType as SessionType,
      location: newPackLocation as LocationType,
      purchasedDate: now,
      remainingSessions: parseInt(newPackSize),
      isActive: true,
      weeklyFrequency: newPackFrequency,
      sessions: [],
      createdAt: now,
      updatedAt: now,
    };
    
    // Call callback if provided
    if (onNewPack) {
      onNewPack(newPack);
    }
    
    toast({
      title: "Pack Created",
      description: `Created a new ${newPackSize}-session ${newPackSubject} pack.`,
    });
    
    // Reset form
    setNewPackSubject('');
    setNewPackType('');
    setNewPackLocation('');
    setNewPackSize('');
    setNewPackFrequency('once');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Session Packs</h2>
        <p className="text-muted-foreground">Manage student session packs</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Packs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentPacks.filter(pack => pack.isActive).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active packs found
              </div>
            ) : (
              studentPacks
                .filter(pack => pack.isActive)
                .map(pack => (
                <div 
                  key={pack.id} 
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{pack.subject}</h3>
                      <div className="text-sm text-muted-foreground">
                        {pack.sessionType} - {pack.location}
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
                      <span className="font-medium">{pack.remainingSessions} sessions</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Purchased:</span>
                      <span className="font-medium">{new Date(pack.purchasedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Frequency:</span>
                      <span className="font-medium">Weekly {pack.weeklyFrequency}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Sessions
                    </Button>
                    {pack.remainingSessions === 0 && (
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
              disabled={!newPackSubject || !newPackType || !newPackLocation || !newPackSize || !isLocationValid()}
            >
              Create Pack
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pack History</CardTitle>
        </CardHeader>
        <CardContent>
          {studentPacks.filter(pack => !pack.isActive).length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No pack history found
            </div>
          ) : (
            <div className="space-y-4">
              {studentPacks
                .filter(pack => !pack.isActive)
                .map(pack => (
                <div key={pack.id} className="flex items-center justify-between p-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{pack.subject} - {pack.sessionType}</div>
                    <div className="text-sm text-muted-foreground">
                      {pack.size} sessions, purchased {new Date(pack.purchasedDate).toLocaleDateString()}
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
