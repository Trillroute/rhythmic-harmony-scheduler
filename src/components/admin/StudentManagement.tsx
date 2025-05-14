
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpenIcon, 
  Pencil, 
  PackageIcon,
  BarChart3Icon,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for demonstration
const mockStudents = [
  { id: '1', name: 'Jane Smith', email: 'jane.smith@example.com', subjects: ['Guitar', 'Vocals'], activePacks: 2, progress: 78 },
  { id: '2', name: 'Mike Johnson', email: 'mike.johnson@example.com', subjects: ['Piano'], activePacks: 1, progress: 45 },
  { id: '3', name: 'Sarah Williams', email: 'sarah.williams@example.com', subjects: ['Drums', 'Guitar'], activePacks: 3, progress: 92 },
  { id: '4', name: 'Alex Turner', email: 'alex.turner@example.com', subjects: ['Piano', 'Vocals'], activePacks: 0, progress: 10 },
  { id: '5', name: 'Emma Davis', email: 'emma.davis@example.com', subjects: ['Ukulele'], activePacks: 1, progress: 60 },
];

const StudentManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter students based on search query
  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <Button>Add New Student</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>View and manage your students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search students..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Active Packs</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {student.subjects.map((subject) => (
                            <Badge key={subject} variant="outline">{subject}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.activePacks > 0 ? "default" : "secondary"}>
                          {student.activePacks}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-secondary h-2 rounded-full">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <PackageIcon className="mr-2 h-4 w-4" />
                              View Packs
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BookOpenIcon className="mr-2 h-4 w-4" />
                              View Courses
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3Icon className="mr-2 h-4 w-4" />
                              Progress Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">No students found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
