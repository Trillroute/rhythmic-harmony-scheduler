
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LocationType, PackSize, SessionType, SubjectType, WeeklyFrequency } from "@/lib/types";
import { toast } from "sonner";

// Export the SessionPack type so it can be used in other files
export interface SessionPack {
  id: string;
  student_id: string;
  subject: SubjectType;
  session_type: SessionType;
  location: LocationType;
  size: PackSize;
  remaining_sessions: number;
  purchased_date: string;
  expiry_date: string | null;
  is_active: boolean;
  weekly_frequency: WeeklyFrequency;
  created_at?: string;
  updated_at?: string;
}

interface CreatePackParams {
  studentId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  size: PackSize;
  weeklyFrequency: WeeklyFrequency;
  purchasedDate?: Date;
  expiryDate?: Date;
}

export const usePacks = (studentId?: string) => {
  const queryClient = useQueryClient();

  const packQuery = useQuery({
    queryKey: ["session-packs", studentId],
    queryFn: async () => {
      let query = supabase
        .from("session_packs")
        .select("*");
      
      if (studentId) {
        query = query.eq("student_id", studentId);
      }
      
      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!studentId
  });

  const createPackMutation = useMutation({
    mutationFn: async (params: CreatePackParams) => {
      const {
        studentId,
        subject,
        sessionType,
        location,
        size,
        weeklyFrequency,
        purchasedDate = new Date(),
        expiryDate
      } = params;

      // Convert PackSize to string for the database
      const packData = {
        student_id: studentId,
        subject,
        session_type: sessionType,
        location,
        size: size.toString(), // Convert to string for DB compatibility
        remaining_sessions: Number(size),
        purchased_date: purchasedDate.toISOString(),
        expiry_date: expiryDate ? expiryDate.toISOString() : null,
        is_active: true,
        weekly_frequency: weeklyFrequency
      };

      const { data, error } = await supabase
        .from("session_packs")
        .insert(packData)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-packs", studentId] });
      toast.success("Session pack created successfully!");
    },
    onError: (error) => {
      console.error("Error creating session pack:", error);
      toast.error(`Failed to create session pack: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  const updatePackMutation = useMutation({
    mutationFn: async (pack: Partial<SessionPack> & { id: string }) => {
      const { id, ...updatedData } = pack;
      
      // Convert size and dates to string for DB compatibility
      const packData = {
        ...updatedData,
        size: updatedData.size?.toString(),
        purchased_date: updatedData.purchased_date ? new Date(updatedData.purchased_date).toISOString() : undefined,
        expiry_date: updatedData.expiry_date ? new Date(updatedData.expiry_date).toISOString() : null
      };
      
      const { data, error } = await supabase
        .from("session_packs")
        .update(packData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-packs", studentId] });
      toast.success("Session pack updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating session pack:", error);
      toast.error(`Failed to update session pack: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  return {
    packs: packQuery.data || [],
    isLoading: packQuery.isLoading,
    error: packQuery.error,
    createPack: createPackMutation.mutateAsync,
    updatePack: updatePackMutation.mutateAsync,
    isPendingCreate: createPackMutation.isPending,
    isPendingUpdate: updatePackMutation.isPending
  };
};

// Create wrapper functions with more specific names
export const useSessionPacks = (studentId?: string) => {
  return usePacks(studentId);
};

// For creating session packs
export const useCreateSessionPack = () => {
  const { createPack } = usePacks();
  return { createPack };
};

// Now let's implement the StudentPayments page with functionality to display payment history
<lov-write file_path="src/pages/student/StudentPayments.tsx">
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSessionPacks } from '@/hooks/use-packs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  const { packs } = useSessionPacks();

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from a payments table
        // For now, we'll generate sample data based on packs
        if (packs && packs.data) {
          const mockPayments = packs.data.map(pack => ({
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

    fetchPayments();
  }, [packs]);

  const calculatePackPrice = (sessionType: string, size: string): number => {
    // Mock pricing logic
    const basePrice = sessionType === 'Solo' ? 50 : 
                     sessionType === 'Duo' ? 35 : 
                     sessionType === 'Focus' ? 40 : 30;
    
    return basePrice * parseInt(size);
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
            {isLoading ? (
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
