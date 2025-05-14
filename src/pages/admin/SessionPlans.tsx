
import React from 'react';
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

// Mock data for demonstration
const mockPlans = [
  { id: '1', name: 'Beginner Guitar', course: 'Guitar Fundamentals', price: 199, sessions: 8, validity: 60, status: 'active' },
  { id: '2', name: 'Intermediate Piano', course: 'Piano Mastery', price: 299, sessions: 12, validity: 90, status: 'active' },
  { id: '3', name: 'Advanced Drums', course: 'Drum Techniques', price: 349, sessions: 10, validity: 60, status: 'inactive' },
  { id: '4', name: 'Vocal Training Intensive', course: 'Vocal Training', price: 249, sessions: 8, validity: 45, status: 'active' },
  { id: '5', name: 'Ukulele for Beginners', course: 'Ukulele Basics', price: 179, sessions: 6, validity: 45, status: 'active' },
];

const SessionPlans = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter plans based on search query
  const filteredPlans = mockPlans.filter(plan => 
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Session Plans</h1>
        <Button>Create New Plan</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
          <CardDescription>Manage your session plans and packages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search plans..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Validity (days)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.course}</TableCell>
                      <TableCell>${plan.price}</TableCell>
                      <TableCell>{plan.sessions}</TableCell>
                      <TableCell>{plan.validity}</TableCell>
                      <TableCell>
                        <Badge variant={plan.status === 'active' ? "default" : "secondary"}>
                          {plan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                        <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">No plans found</TableCell>
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

export default SessionPlans;
