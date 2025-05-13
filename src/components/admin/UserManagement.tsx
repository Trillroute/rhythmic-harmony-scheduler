
import React, { useState } from "react";
import { useUsers, UserWithRole } from "@/hooks/use-users";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserRole, SubjectType } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PencilIcon, TrashIcon, MailIcon, UserIcon, UserPlusIcon, SearchIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const UserManagement = () => {
  const [filters, setFilters] = useState<{ role?: string; email?: string }>({});
  const { users, isLoading, error, updateUser, deleteUser } = useUsers(filters);
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  
  // Handle role filter change
  const handleRoleFilterChange = (role: string) => {
    if (filters.role === role) {
      setFilters(prev => ({ ...prev, role: undefined }));
    } else {
      setFilters(prev => ({ ...prev, role }));
    }
  };
  
  // Handle email search
  const handleEmailSearch = () => {
    setFilters(prev => ({ ...prev, email: searchEmail }));
  };
  
  // Handle user edit
  const handleEditUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };
  
  // Handle user delete
  const handleDeleteUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete user
  const confirmDeleteUser = () => {
    if (!selectedUser) return;
    
    deleteUser(selectedUser.id);
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Handle password reset (this would typically call an auth endpoint)
  const handlePasswordReset = (user: UserWithRole) => {
    // In a real app, you'd call a password reset endpoint
    toast({
      title: "Password Reset Email Sent",
      description: `A password reset email has been sent to ${user.email}`,
    });
  };
  
  if (isLoading) {
    return <div className="p-8">Loading users...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-red-500">Error loading users: {error.message}</div>;
  }
  
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">User Management</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search by email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full md:w-64"
            />
            <Button onClick={handleEmailSearch} variant="outline" size="icon">
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant={filters.role === 'admin' ? "default" : "outline"} 
              onClick={() => handleRoleFilterChange('admin')}
              size="sm"
            >
              Admins
            </Button>
            <Button 
              variant={filters.role === 'teacher' ? "default" : "outline"} 
              onClick={() => handleRoleFilterChange('teacher')}
              size="sm"
            >
              Teachers
            </Button>
            <Button 
              variant={filters.role === 'student' ? "default" : "outline"} 
              onClick={() => handleRoleFilterChange('student')}
              size="sm"
            >
              Students
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users && users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <Badge>{user.role}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                {user.role === 'teacher' && user.teacherData && (
                  <>
                    <p><strong>Subjects:</strong> {user.teacherData.subjects.join(', ') || 'None'}</p>
                    <p><strong>Max Weekly Sessions:</strong> {user.teacherData.maxWeeklySessions || 'Not set'}</p>
                  </>
                )}
                {user.role === 'student' && user.studentData && (
                  <>
                    <p><strong>Preferred Subjects:</strong> {user.studentData.preferredSubjects?.join(', ') || 'None'}</p>
                    {user.studentData.notes && (
                      <p><strong>Notes:</strong> {user.studentData.notes}</p>
                    )}
                  </>
                )}
                {user.role === 'admin' && user.adminData && (
                  <p><strong>Permissions:</strong> {user.adminData.permissions?.join(', ') || 'All'}</p>
                )}
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePasswordReset(user)}
                  title="Send password reset email"
                >
                  <MailIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditUser(user)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteUser(user)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue={selectedUser.name}
                  onChange={(e) => {
                    setSelectedUser({
                      ...selectedUser,
                      name: e.target.value
                    });
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue={selectedUser.email}
                  onChange={(e) => {
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value
                    });
                  }}
                />
              </div>
              
              {selectedUser.role === 'teacher' && (
                <div className="space-y-2">
                  <Label>Subjects</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal'].map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subject-${subject}`}
                          checked={selectedUser.teacherData?.subjects.includes(subject as SubjectType)}
                          onCheckedChange={(checked) => {
                            const newSubjects = checked
                              ? [...(selectedUser.teacherData?.subjects || []), subject as SubjectType]
                              : selectedUser.teacherData?.subjects.filter(s => s !== subject) || [];
                            
                            setSelectedUser({
                              ...selectedUser,
                              teacherData: {
                                ...selectedUser.teacherData,
                                subjects: newSubjects
                              }
                            });
                          }}
                        />
                        <Label htmlFor={`subject-${subject}`}>{subject}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedUser.role === 'student' && (
                <div className="space-y-2">
                  <Label>Preferred Subjects</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal'].map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subject-${subject}`}
                          checked={selectedUser.studentData?.preferredSubjects?.includes(subject as SubjectType)}
                          onCheckedChange={(checked) => {
                            const newSubjects = checked
                              ? [...(selectedUser.studentData?.preferredSubjects || []), subject as SubjectType]
                              : selectedUser.studentData?.preferredSubjects?.filter(s => s !== subject) || [];
                            
                            setSelectedUser({
                              ...selectedUser,
                              studentData: {
                                ...selectedUser.studentData,
                                preferredSubjects: newSubjects
                              }
                            });
                          }}
                        />
                        <Label htmlFor={`subject-${subject}`}>{subject}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedUser) {
                  updateUser(selectedUser);
                  setIsEditDialogOpen(false);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
