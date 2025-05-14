
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
import { Plus, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CourseMaterial {
  id: string;
  title: string;
  course_id: string;
  module_number: number | null;
  file_type: string;
  is_public: boolean;
  uploaded_by: string;
  created_at: string;
  course: {
    name: string;
  };
}

const CourseMaterials = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['course_materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_materials')
        .select(`
          *,
          course: course_id (name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw new Error(`Error fetching course materials: ${error.message}`);
      return data as CourseMaterial[];
    }
  });

  // Filter materials based on search query
  const filteredMaterials = materials?.filter(material => 
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.course?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.file_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Course Materials</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Material
        </Button>
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
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-4 text-destructive bg-destructive/10 rounded-md">
              {error instanceof Error ? error.message : "Failed to load materials"}
            </div>
          ) : (
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
                  {filteredMaterials && filteredMaterials.length > 0 ? (
                    filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.title}</TableCell>
                        <TableCell>{material.course?.name || 'Unknown'}</TableCell>
                        <TableCell>{material.module_number ? `Module ${material.module_number}` : 'N/A'}</TableCell>
                        <TableCell>{material.file_type}</TableCell>
                        <TableCell>
                          <Badge variant={material.is_public ? 'default' : 'secondary'}>
                            {material.is_public ? 'Public' : 'Private'}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(material.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" className="mr-2">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="mr-2">
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseMaterials;
