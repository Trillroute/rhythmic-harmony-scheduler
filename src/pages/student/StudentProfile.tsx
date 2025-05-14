
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

// Mock student data
const studentData = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 555-987-6543',
  preferredSubjects: ['Guitar', 'Piano'],
  preferredTeachers: ['John Smith', 'Maria Rodriguez'],
  profileImageUrl: '',
  joinDate: '2022-03-10',
  address: {
    street: '123 Main St',
    city: 'Musicville',
    state: 'CA',
    zipCode: '90210',
    country: 'USA'
  },
  emergencyContact: {
    name: 'Sarah Johnson',
    relationship: 'Parent',
    phone: '+1 555-777-8888'
  },
  notes: 'Interested in learning classical guitar and basic piano techniques. Has previous experience with ukulele.'
};

const StudentProfile = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(studentData);
  
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
  
  const handleAddressChange = (field: string, value: string) => {
    setProfile({
      ...profile,
      address: {
        ...profile.address,
        [field]: value
      }
    });
  };
  
  const handleEmergencyContactChange = (field: string, value: string) => {
    setProfile({
      ...profile,
      emergencyContact: {
        ...profile.emergencyContact,
        [field]: value
      }
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
          <TabsTrigger value="details">Personal Details</TabsTrigger>
          <TabsTrigger value="preferences">Learning Preferences</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
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
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Address</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={profile.address.street}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={profile.address.city}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Input
                            id="state"
                            value={profile.address.state}
                            onChange={(e) => handleAddressChange('state', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Zip/Postal Code</Label>
                          <Input
                            id="zipCode"
                            value={profile.address.zipCode}
                            onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={profile.address.country}
                            onChange={(e) => handleAddressChange('country', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Personal Notes</Label>
                    <Textarea
                      id="notes"
                      value={profile.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      placeholder="Add any additional notes about yourself or your learning goals"
                    />
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
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Address</h3>
                      <div className="space-y-1">
                        <p className="text-sm">{profile.address.street}</p>
                        <p className="text-sm">{profile.address.city}, {profile.address.state} {profile.address.zipCode}</p>
                        <p className="text-sm">{profile.address.country}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Notes</h3>
                    <p className="text-sm">{profile.notes}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>Your preferred instruments and teachers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Preferred Instruments</h3>
                  {editMode ? (
                    <div className="flex flex-wrap gap-2">
                      {['Guitar', 'Piano', 'Drums', 'Vocal', 'Ukulele'].map((subject) => (
                        <Badge
                          key={subject}
                          variant={profile.preferredSubjects.includes(subject) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const updatedSubjects = profile.preferredSubjects.includes(subject)
                              ? profile.preferredSubjects.filter(s => s !== subject)
                              : [...profile.preferredSubjects, subject];
                            handleInputChange('preferredSubjects', updatedSubjects);
                          }}
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {profile.preferredSubjects.map(subject => (
                        <Badge key={subject} variant="secondary">{subject}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Preferred Teachers</h3>
                  {!editMode && (
                    <div className="flex flex-wrap gap-1">
                      {profile.preferredTeachers.map(teacher => (
                        <Badge key={teacher} variant="outline">{teacher}</Badge>
                      ))}
                    </div>
                  )}
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
        
        <TabsContent value="emergency" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Contact person in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ec-name">Name</Label>
                    <Input
                      id="ec-name"
                      value={profile.emergencyContact.name}
                      onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ec-relationship">Relationship</Label>
                    <Input
                      id="ec-relationship"
                      value={profile.emergencyContact.relationship}
                      onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ec-phone">Phone Number</Label>
                    <Input
                      id="ec-phone"
                      value={profile.emergencyContact.phone}
                      onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setEditMode(false)}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Name</h3>
                      <p>{profile.emergencyContact.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Relationship</h3>
                      <p>{profile.emergencyContact.relationship}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Phone</h3>
                      <p>{profile.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProfile;
