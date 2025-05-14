
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
import { format } from 'date-fns';

// Mock data - in a real implementation, this would come from your API
const mockMaterials = [
  { id: '1', title: 'Guitar Chord Basics', course: 'Guitar Fundamentals', type: 'PDF', public: true, uploadDate: new Date(2025, 3, 15), module: 1 },
  { id: '2', title: 'Piano Scales Video', course: 'Piano Mastery', type: 'Video', public: false, uploadDate: new Date(2025, 4, 3), module: 2 },
  { id: '3', title: 'Drum Notation Guide', course: 'Drum Basics', type: 'PDF', public: true, uploadDate: new Date(2025, 2, 20), module: 1 },
  { id: '4', title: 'Vocal Warm-up Exercises', course: 'Vocal Training', type: 'Audio', public: false, uploadDate: new Date(2025, 4, 10), module: 3 },
];

const CourseMaterials: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState(mockMaterials);

  // Filter materials based on search query
  const filteredMaterials = materials.filter(material => 
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Course Materials</h1>
        <Button>Upload Material</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Materials</CardTitle>
          <CardDescription>Manage learning materials for courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search materials..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.title}</TableCell>
                      <TableCell>{material.course}</TableCell>
                      <TableCell>Module {material.module}</TableCell>
                      <TableCell>{material.type}</TableCell>
                      <TableCell>
                        <Badge variant={material.public ? 'default' : 'secondary'}>
                          {material.public ? 'Public' : 'Private'}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(material.uploadDate, 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" className="mr-2">View</Button>
                        <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                        <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">No materials found</TableCell>
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

export default CourseMaterials;
