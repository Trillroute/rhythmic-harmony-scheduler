
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
const mockInvoices = [
  { id: '1', student: 'John Doe', amount: 120, status: 'paid', dueDate: new Date(2025, 4, 20), paidDate: new Date(2025, 4, 18) },
  { id: '2', student: 'Alice Smith', amount: 180, status: 'pending', dueDate: new Date(2025, 5, 1), paidDate: null },
  { id: '3', student: 'Robert Johnson', amount: 150, status: 'overdue', dueDate: new Date(2025, 3, 15), paidDate: null },
  { id: '4', student: 'Emily Davis', amount: 200, status: 'paid', dueDate: new Date(2025, 4, 10), paidDate: new Date(2025, 4, 8) },
];

const InvoiceManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState(mockInvoices);

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(invoice => 
    invoice.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
        <Button>Create New Invoice</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Manage student invoices and payments</CardDescription>
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
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.student}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{format(invoice.dueDate, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.paidDate ? format(invoice.paidDate, 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" className="mr-2">View</Button>
                        {invoice.status !== 'paid' && (
                          <Button variant="outline" size="sm">Record Payment</Button>
                        )}
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
