
import React, { useState } from "react";
import { useSystemSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectType, SessionType, PackSize } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const SystemSettings = () => {
  const { settings, isLoading, error, getSetting, updateSetting, isPending } = useSystemSettings();
  const { toast } = useToast();
  
  // Session durations
  const [sessionDurations, setSessionDurations] = useState<{ solo: number; duo: number; focus: number } | null>(null);
  
  // Session limits
  const [sessionLimits, setSessionLimits] = useState<{
    max_weekly_per_teacher: number;
    max_daily_per_teacher: number;
    advance_booking_days: number;
  } | null>(null);
  
  // Pack sizes and pricing
  const [packSizes, setPackSizes] = useState<Record<string, number> | null>(null);
  
  // Supported subjects
  const [supportedSubjects, setSupportedSubjects] = useState<string[] | null>(null);
  
  // Initialize form data when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setSessionDurations(getSetting('session_durations'));
      setSessionLimits(getSetting('session_limits'));
      setPackSizes(getSetting('pack_sizes'));
      setSupportedSubjects(getSetting('supported_subjects'));
    }
  }, [settings, getSetting]);
  
  // Save session durations
  const saveSessionDurations = () => {
    if (sessionDurations) {
      updateSetting({
        key: 'session_durations',
        value: sessionDurations
      });
    }
  };
  
  // Save session limits
  const saveSessionLimits = () => {
    if (sessionLimits) {
      updateSetting({
        key: 'session_limits',
        value: sessionLimits
      });
    }
  };
  
  // Save pack sizes
  const savePackSizes = () => {
    if (packSizes) {
      updateSetting({
        key: 'pack_sizes',
        value: packSizes
      });
    }
  };
  
  // Save supported subjects
  const saveSupportedSubjects = () => {
    if (supportedSubjects) {
      updateSetting({
        key: 'supported_subjects',
        value: supportedSubjects
      });
    }
  };
  
  // Handle adding a new subject
  const [newSubject, setNewSubject] = useState("");
  
  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive"
      });
      return;
    }
    
    if (supportedSubjects?.includes(newSubject)) {
      toast({
        title: "Error",
        description: "This subject already exists",
        variant: "destructive"
      });
      return;
    }
    
    setSupportedSubjects(prev => prev ? [...prev, newSubject] : [newSubject]);
    setNewSubject("");
  };
  
  // Handle removing a subject
  const handleRemoveSubject = (subject: string) => {
    setSupportedSubjects(prev => prev ? prev.filter(s => s !== subject) : []);
  };
  
  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-red-500">Error loading settings: {error.message}</div>;
  }
  
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      
      <Tabs defaultValue="session-durations">
        <TabsList className="mb-6">
          <TabsTrigger value="session-durations">Session Durations</TabsTrigger>
          <TabsTrigger value="session-limits">Session Limits</TabsTrigger>
          <TabsTrigger value="pack-sizes">Pack Sizes & Pricing</TabsTrigger>
          <TabsTrigger value="subjects">Instruments</TabsTrigger>
        </TabsList>
        
        {/* Session Durations */}
        <TabsContent value="session-durations">
          <Card>
            <CardHeader>
              <CardTitle>Session Durations</CardTitle>
              <CardDescription>Set the default duration (in minutes) for each session type</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionDurations && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="solo-duration">Solo Session Duration</Label>
                      <Input
                        id="solo-duration"
                        type="number"
                        value={sessionDurations.solo}
                        onChange={(e) => setSessionDurations(prev => ({
                          ...prev!,
                          solo: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duo-duration">Duo Session Duration</Label>
                      <Input
                        id="duo-duration"
                        type="number"
                        value={sessionDurations.duo}
                        onChange={(e) => setSessionDurations(prev => ({
                          ...prev!,
                          duo: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="focus-duration">Focus Session Duration</Label>
                      <Input
                        id="focus-duration"
                        type="number"
                        value={sessionDurations.focus}
                        onChange={(e) => setSessionDurations(prev => ({
                          ...prev!,
                          focus: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={saveSessionDurations} disabled={isPending}>
                    {isPending ? "Saving..." : "Save Durations"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Session Limits */}
        <TabsContent value="session-limits">
          <Card>
            <CardHeader>
              <CardTitle>Session Limits</CardTitle>
              <CardDescription>Set limits for session scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionLimits && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-weekly">Max Weekly Sessions per Teacher</Label>
                      <Input
                        id="max-weekly"
                        type="number"
                        value={sessionLimits.max_weekly_per_teacher}
                        onChange={(e) => setSessionLimits(prev => ({
                          ...prev!,
                          max_weekly_per_teacher: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-daily">Max Daily Sessions per Teacher</Label>
                      <Input
                        id="max-daily"
                        type="number"
                        value={sessionLimits.max_daily_per_teacher}
                        onChange={(e) => setSessionLimits(prev => ({
                          ...prev!,
                          max_daily_per_teacher: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="advance-days">Advance Booking Days</Label>
                      <Input
                        id="advance-days"
                        type="number"
                        value={sessionLimits.advance_booking_days}
                        onChange={(e) => setSessionLimits(prev => ({
                          ...prev!,
                          advance_booking_days: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={saveSessionLimits} disabled={isPending}>
                    {isPending ? "Saving..." : "Save Limits"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pack Sizes & Pricing */}
        <TabsContent value="pack-sizes">
          <Card>
            <CardHeader>
              <CardTitle>Pack Sizes & Pricing</CardTitle>
              <CardDescription>Configure available pack sizes and their pricing</CardDescription>
            </CardHeader>
            <CardContent>
              {packSizes && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(packSizes).map(([size, price]) => (
                      <div key={size} className="flex items-center space-x-4">
                        <div className="w-1/2">
                          <Label htmlFor={`pack-${size}`}>{size} Sessions Pack</Label>
                        </div>
                        <div className="w-1/2">
                          <div className="flex items-center">
                            <span className="mr-2">$</span>
                            <Input
                              id={`pack-${size}`}
                              type="number"
                              value={price}
                              onChange={(e) => setPackSizes(prev => ({
                                ...prev!,
                                [size]: parseInt(e.target.value)
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button onClick={savePackSizes} disabled={isPending}>
                    {isPending ? "Saving..." : "Save Pack Pricing"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Instruments (Subjects) */}
        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Instruments</CardTitle>
              <CardDescription>Manage supported instruments (subjects) for lessons</CardDescription>
            </CardHeader>
            <CardContent>
              {supportedSubjects && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {supportedSubjects.map((subject) => (
                      <div key={subject} className="flex items-center justify-between p-2 border rounded">
                        <span>{subject}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveSubject(subject)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="New instrument name"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                    />
                    <Button onClick={handleAddSubject}>Add</Button>
                  </div>
                  
                  <Button onClick={saveSupportedSubjects} disabled={isPending}>
                    {isPending ? "Saving..." : "Save Instruments"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
