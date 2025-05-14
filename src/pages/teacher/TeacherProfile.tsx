
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

// Mock teacher data
const teacherData = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '+1 555-123-4567',
  bio: 'Professional guitar and ukulele teacher with over 10 years of experience...',
  subjects: ['Guitar', 'Ukulele'],
  education: [
    { id: '1', degree: 'Master of Music', institution: 'Berklee College of Music', year: '2015' },
    { id: '2', degree: 'Bachelor of Arts in Music', institution: 'University of Southern California', year: '2012' }
  ],
  availability: {
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [{ start: '10:00', end: '14:00' }],
    sunday: []
  },
  preferredLocations: ['Online', 'Offline'],
  hourlyRate: 45,
  profileImageUrl: '',
  joinDate: '2021-06-15'
};

const TeacherProfile = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(teacherData);
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the profile
    console.log('Updating profile:', profile);
    setEditMode(false);
  };
  
  const handleInputChange = (field: string, value: any) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        {!editMode && (
          <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
        )}
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Profile Details</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-6">
          {editMode ? (
            <form onSubmit={handleUpdateProfile}>
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.profileImageUrl} />
                      <AvatarFallback className="text-lg">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline">Upload Photo</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        readOnly
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={profile.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Subjects</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Guitar', 'Piano', 'Drums', 'Vocal', 'Ukulele'].map((subject) => (
                        <Badge
                          key={subject}
                          variant={profile.subjects.includes(subject) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const updatedSubjects = profile.subjects.includes(subject)
                              ? profile.subjects.filter(s => s !== subject)
                              : [...profile.subjects, subject];
                            handleInputChange('subjects', updatedSubjects);
                          }}
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Education</Label>
                    {profile.education.map((edu, index) => (
                      <div key={edu.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                        <Input
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => {
                            const updatedEducation = [...profile.education];
                            updatedEducation[index].degree = e.target.value;
                            handleInputChange('education', updatedEducation);
                          }}
                        />
                        <Input
                          placeholder="Institution"
                          value={edu.institution}
                          onChange={(e) => {
                            const updatedEducation = [...profile.education];
                            updatedEducation[index].institution = e.target.value;
                            handleInputChange('education', updatedEducation);
                          }}
                        />
                        <Input
                          placeholder="Year"
                          value={edu.year}
                          onChange={(e) => {
                            const updatedEducation = [...profile.education];
                            updatedEducation[index].year = e.target.value;
                            handleInputChange('education', updatedEducation);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newEducation = [
                          ...profile.education, 
                          { id: `new-${Date.now()}`, degree: '', institution: '', year: '' }
                        ];
                        handleInputChange('education', newEducation);
                      }}
                    >
                      Add Education
                    </Button>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 gap-4 pb-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.profileImageUrl} />
                    <AvatarFallback className="text-lg">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{profile.name}</CardTitle>
                    <CardDescription>Member since {new Date(profile.joinDate).toLocaleDateString()}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Contact Information</h3>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Email:</span> {profile.email}</p>
                        <p className="text-sm"><span className="font-medium">Phone:</span> {profile.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-1">
                        {profile.subjects.map(subject => (
                          <Badge key={subject} variant="secondary">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">About Me</h3>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Education</h3>
                    <ul className="space-y-2">
                      {profile.education.map(edu => (
                        <li key={edu.id} className="text-sm">
                          <strong>{edu.degree}</strong> - {edu.institution}, {edu.year}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Rate</h3>
                    <p className="text-sm">${profile.hourlyRate} / hour</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="availability" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>Set your regular teaching hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day} className="flex items-center justify-between border-b pb-3">
                    <div className="font-medium capitalize">{day}</div>
                    <div>
                      {(profile.availability as any)[day].length > 0 ? (
                        <div className="flex items-center gap-2">
                          <span>
                            {(profile.availability as any)[day].map((slot: any, i: number) => (
                              <span key={i}>{slot.start} - {slot.end}{i < (profile.availability as any)[day].length - 1 ? ', ' : ''}</span>
                            ))}
                          </span>
                          {editMode && <Button size="sm" variant="ghost">Edit</Button>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not Available</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Preferences</CardTitle>
              <CardDescription>Customize your teaching preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Preferred Locations</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="online" 
                      checked={profile.preferredLocations.includes('Online')}
                      onChange={(e) => {
                        const updatedLocations = e.target.checked
                          ? [...profile.preferredLocations, 'Online']
                          : profile.preferredLocations.filter(l => l !== 'Online');
                        handleInputChange('preferredLocations', updatedLocations);
                      }}
                      disabled={!editMode}
                      className="rounded"
                    />
                    <Label htmlFor="online">Online</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="offline" 
                      checked={profile.preferredLocations.includes('Offline')}
                      onChange={(e) => {
                        const updatedLocations = e.target.checked
                          ? [...profile.preferredLocations, 'Offline']
                          : profile.preferredLocations.filter(l => l !== 'Offline');
                        handleInputChange('preferredLocations', updatedLocations);
                      }}
                      disabled={!editMode}
                      className="rounded"
                    />
                    <Label htmlFor="offline">In-Person</Label>
                  </div>
                </div>
              </div>
              
              {editMode && (
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setEditMode(false)}>
                    Save Changes
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

export default TeacherProfile;
