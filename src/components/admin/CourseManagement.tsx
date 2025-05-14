
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

// Mock data - in a real implementation, this would come from your API
const mockCourses = [
  { id: '1', name: 'Guitar Fundamentals', instrument: 'Guitar', sessionType: 'Solo', status: 'active', sessions: 12 },
  { id: '2', name: 'Piano Mastery', instrument: 'Piano', sessionType: 'Solo', status: 'active', sessions: 24 },
  { id: '3', name: 'Drum Basics', instrument: 'Drums', sessionType: 'Focus', status: 'inactive', sessions: 8 },
  { id: '4', name: 'Vocal Training', instrument: 'Vocal', sessionType: 'Solo', status: 'active', sessions: 16 },
];

const CourseManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState(mockCourses);

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instrument.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
        <Button>Add New Course</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>Manage your course offerings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search courses..."
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
                  <TableHead>Instrument</TableHead>
                  <TableHead>Session Type</TableHead>
                  <TableHead>Total Sessions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.instrument}</TableCell>
                      <TableCell>{course.sessionType}</TableCell>
                      <TableCell>{course.sessions}</TableCell>
                      <TableCell>
                        <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                        <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">No courses found</TableCell>
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

export default CourseManagement;
