
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessionPacks } from '@/hooks/use-packs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
}

const StudentPayments = () => {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { packs, isLoading: isPacksLoading } = useSessionPacks();

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from a payments table
        // For now, we'll generate sample data based on packs
        if (packs && packs.length > 0) {
          const mockPayments = packs.map(pack => ({
            id: pack.id,
            date: new Date(pack.purchased_date).toISOString(),
            amount: calculatePackPrice(pack.session_type, pack.size),
            description: `${pack.size} ${pack.subject} ${pack.session_type} Sessions`,
            status: 'paid' as const
          }));
          setPayments(mockPayments);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isPacksLoading) {
      fetchPayments();
    }
  }, [packs, isPacksLoading]);

  const calculatePackPrice = (sessionType: string, size: string | number): number => {
    // Mock pricing logic
    const basePrice = sessionType === 'Solo' ? 50 : 
                     sessionType === 'Duo' ? 35 : 
                     sessionType === 'Focus' ? 40 : 30;
    
    const packSize = typeof size === 'string' ? parseInt(size) : size;
    return basePrice * packSize;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Payments</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || isPacksLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Loading payment history...</p>
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(payment.date)}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        <Badge className={getStatusColor(payment.status)} variant="outline">
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-muted-foreground mb-2">No payment history found</p>
                <p className="text-sm text-muted-foreground">When you purchase session packs, your payment history will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-muted-foreground mb-2">No upcoming payments due</p>
              <p className="text-sm text-muted-foreground">
                All your payments are up to date. You can purchase new packs at any time.
              </p>
              <Button className="mt-4" variant="outline">
                Purchase New Pack
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPayments;
