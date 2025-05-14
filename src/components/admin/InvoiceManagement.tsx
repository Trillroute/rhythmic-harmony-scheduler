
import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useStudentInvoices, Invoice } from '@/hooks/use-student-invoices';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
}

const InvoiceManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const { toast } = useToast();

  // Fetch all invoices across all students
  useEffect(() => {
    const fetchAllInvoices = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            id, 
            amount, 
            status, 
            created_at,
            due_date,
            pack_id,
            plan_id,
            student_id,
            notes
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedInvoices = (data || []).map(item => ({
          id: item.id,
          amount: item.amount,
          status: item.status,
          createdAt: item.created_at,
          dueDate: item.due_date,
          packId: item.pack_id,
          planId: item.plan_id,
          studentId: item.student_id,
          notes: item.notes
        }));

        setAllInvoices(formattedInvoices);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch invoices'));
        toast({
          title: 'Error fetching invoices',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllInvoices();
  }, [toast]);

  // Fetch student data to display names
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentIds = [...new Set(allInvoices.map(invoice => invoice.studentId))];
        
        if (studentIds.length === 0) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', studentIds);

        if (error) {
          throw error;
        }

        const studentMap: Record<string, Student> = {};
        data.forEach(student => {
          studentMap[student.id] = { id: student.id, name: student.name };
        });

        setStudents(studentMap);
      } catch (err) {
        console.error('Error fetching students:', err);
        toast({
          title: 'Error fetching student data',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      }
    };

    if (allInvoices.length > 0) {
      fetchStudents();
    }
  }, [allInvoices, toast]);

  // Filter invoices based on search query
  const filteredInvoices = allInvoices.filter(invoice => {
    const studentName = students[invoice.studentId]?.name || '';
    return (
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'outline';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);

      if (error) {
        throw error;
      }

      // Update local state
      setAllInvoices(invoices => 
        invoices.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, status: 'paid' } 
            : invoice
        )
      );

      toast({
        title: 'Success',
        description: 'Invoice marked as paid',
      });
    } catch (err) {
      console.error('Error updating invoice:', err);
      toast({
        title: 'Error marking invoice as paid',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
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
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <p>Loading invoices...</p>
            </div>
          ) : error ? (
            <div className="rounded-md bg-destructive/10 p-6 flex flex-col items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-2" />
              <h3 className="text-lg font-medium">Error Loading Invoices</h3>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id.substring(0, 8)}</TableCell>
                        <TableCell>{students[invoice.studentId]?.name || 'Unknown Student'}</TableCell>
                        <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{invoice.dueDate && format(new Date(invoice.dueDate), 'PP')}</TableCell>
                        <TableCell>{invoice.notes || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" className="mr-2">View</Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={invoice.status === 'paid'}
                            onClick={() => invoice.status !== 'paid' && handleMarkAsPaid(invoice.id)}
                          >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceManagement;
