
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

// Mock data for demonstration
const mockInvoices = [
  { id: '1', student: 'Jane Smith', amount: 199, dueDate: new Date(2025, 5, 25), status: 'paid', plan: 'Beginner Guitar' },
  { id: '2', student: 'Mike Johnson', amount: 299, dueDate: new Date(2025, 5, 30), status: 'pending', plan: 'Intermediate Piano' },
  { id: '3', student: 'Sarah Williams', amount: 349, dueDate: new Date(2025, 6, 5), status: 'overdue', plan: 'Advanced Drums' },
  { id: '4', student: 'Alex Turner', amount: 249, dueDate: new Date(2025, 6, 10), status: 'pending', plan: 'Vocal Training Intensive' },
  { id: '5', student: 'Emma Davis', amount: 179, dueDate: new Date(2025, 6, 15), status: 'paid', plan: 'Ukulele for Beginners' },
];

const InvoiceManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter invoices based on search query
  const filteredInvoices = mockInvoices.filter(invoice => 
    invoice.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'outline';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
        <Button>Generate Invoice</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Track and manage student payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search invoices..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">INV-{invoice.id.padStart(5, '0')}</TableCell>
                      <TableCell>{invoice.student}</TableCell>
                      <TableCell>${invoice.amount}</TableCell>
                      <TableCell>{format(invoice.dueDate, 'PP')}</TableCell>
                      <TableCell>{invoice.plan}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" className="mr-2">View</Button>
                        <Button variant="outline" size="sm" disabled={invoice.status === 'paid'}>
                          {invoice.status === 'paid' ? 'Paid' : 'Mark Paid'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">No invoices found</TableCell>
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

export default InvoiceManagement;
