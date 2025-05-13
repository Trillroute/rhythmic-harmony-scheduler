
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

// Sample data - in a real app, this would come from an API
const samplePlans = [
  { id: '1', name: 'Beginner Guitar Pack', sessionsCount: 10, price: 299, status: 'active', validityDays: 90 },
  { id: '2', name: 'Advanced Piano Pack', sessionsCount: 20, price: 499, status: 'active', validityDays: 120 },
  { id: '3', name: 'Drum Starter Pack', sessionsCount: 5, price: 149, status: 'inactive', validityDays: 60 },
];

const SessionPlans: React.FC = () => {
  const [plans, setPlans] = useState(samplePlans);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sessionsCount: '',
    price: '',
    validityDays: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.sessionsCount || !formData.price || !formData.validityDays) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would send data to an API
    const newPlan = {
      id: Date.now().toString(),
      name: formData.name,
      sessionsCount: parseInt(formData.sessionsCount),
      price: parseFloat(formData.price),
      status: formData.status,
      validityDays: parseInt(formData.validityDays)
    };

    setPlans([...plans, newPlan]);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      sessionsCount: '',
      price: '',
      validityDays: '',
      status: 'active'
    });
    
    toast.success('Session plan created successfully!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Session Plans</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Plan'}
        </Button>
      </div>
      
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Session Plan</CardTitle>
            <CardDescription>Define parameters for a new student session pack</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Beginner Guitar Pack" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionsCount">Number of Sessions *</Label>
                  <Input 
                    id="sessionsCount"
                    name="sessionsCount"
                    type="number" 
                    value={formData.sessionsCount} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 10" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input 
                    id="price"
                    name="price"
                    type="number" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 299.99" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="validityDays">Validity Period (days) *</Label>
                  <Input 
                    id="validityDays"
                    name="validityDays"
                    type="number" 
                    value={formData.validityDays} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 90" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Enter plan description" 
                />
              </div>
              
              <Button type="submit">Create Plan</Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Available Session Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Price ($)</TableHead>
                <TableHead>Valid For</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map(plan => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.sessionsCount}</TableCell>
                  <TableCell>${plan.price}</TableCell>
                  <TableCell>{plan.validityDays} days</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* TODO: Add integration with backend API to fetch and create real session plans */}
    </div>
  );
};

export default SessionPlans;
