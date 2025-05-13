
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Filter, X } from 'lucide-react';

// Sample data - in a real app, this would come from an API
const sampleStudents = [
  { 
    id: '1', 
    name: 'Jane Smith', 
    email: 'jane.smith@example.com',
    subjects: ['Guitar', 'Piano'],
    enrolledSince: '2023-01-15',
    status: 'active'
  },
  { 
    id: '2', 
    name: 'Michael Johnson', 
    email: 'michael.j@example.com',
    subjects: ['Drums'],
    enrolledSince: '2023-03-22',
    status: 'active'
  },
  { 
    id: '3', 
    name: 'Emily Williams', 
    email: 'emily.w@example.com',
    subjects: ['Piano'],
    enrolledSince: '2022-11-05',
    status: 'inactive'
  },
];

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState(sampleStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const filteredStudents = students.filter(student => {
    // Apply search filter
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    // Apply subject filter
    const matchesSubject = subjectFilter === 'all' || student.subjects.includes(subjectFilter);
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSubjectFilter('all');
  };

  const handleViewDetails = (studentId: string) => {
    // In a real app, this would navigate to a student detail page
    toast.info(`Viewing details for student ${studentId}`);
  };

  const handleManagePacks = (studentId: string) => {
    // In a real app, this would navigate to the student's packs page
    toast.info(`Managing packs for student ${studentId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <Button>Add New Student</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search your students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Guitar">Guitar</SelectItem>
                  <SelectItem value="Piano">Piano</SelectItem>
                  <SelectItem value="Drums">Drums</SelectItem>
                  <SelectItem value="Vocal">Vocal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || statusFilter !== 'all' || subjectFilter !== 'all') && (
            <div className="flex items-center mt-4">
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchTerm}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                  </Badge>
                )}
                
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {statusFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                  </Badge>
                )}
                
                {subjectFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Subject: {subjectFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSubjectFilter('all')} />
                  </Badge>
                )}
              </div>
              
              <Button variant="ghost" size="sm" className="ml-auto" onClick={handleClearFilters}>
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found matching your criteria
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Enrolled Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {student.subjects.map(subject => (
                          <Badge key={subject} variant="outline">{subject}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(student.enrolledSince).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handleViewDetails(student.id)}>
                        View
                      </Button>
                      <Button size="sm" onClick={() => handleManagePacks(student.id)}>
                        Manage Packs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* TODO: Add integration with backend API to fetch real students */}
      {/* TODO: Add student creation form */}
      {/* TODO: Add student details view with attendance history, packs, progress */}
    </div>
  );
};

export default StudentManagement;
