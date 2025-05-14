import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFeePlans, FeePlan } from "@/hooks/use-fee-plans";
import { usePayments } from "@/hooks/use-payments";
import { FeePlanForm } from "./FeePlanForm";
import { PaymentForm } from "./PaymentForm";
import { PlusIcon, PencilIcon, ReceiptIcon, MoreVertical, BanknoteIcon } from "lucide-react";
import { calculateFeePlanSummary, formatDueStatus, getStatusBadgeVariant } from "@/lib/fee-utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface FeePlanDetailsProps {
  studentId: string;
}

export const FeePlanDetails: React.FC<FeePlanDetailsProps> = ({ studentId }) => {
  const { feePlans, createFeePlan, updateFeePlan, deleteFeePlan, isLoading: isLoadingPlans, isPendingCreate, isPendingUpdate, isPendingDelete } = useFeePlans(studentId);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState<FeePlan | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<FeePlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<FeePlan | null>(null);
  
  const { payments, createPayment, isLoading: isLoadingPayments } = usePayments(studentId);
  
  const handleCreatePlan = (data: any) => {
    createFeePlan({
      student_id: studentId,
      ...data
    });
    setIsAddingPlan(false);
  };
  
  const handleUpdatePlan = (data: any) => {
    if (isEditingPlan) {
      updateFeePlan({
        id: isEditingPlan.id,
        ...data
      });
      setIsEditingPlan(null);
    }
  };
  
  const handleDeletePlan = () => {
    if (planToDelete) {
      deleteFeePlan(planToDelete.id);
      setPlanToDelete(null);
      toast.success("Fee plan deleted successfully");
    }
  };
  
  const handleEditPlan = (plan: FeePlan) => {
    setIsEditingPlan(plan);
  };
  
  const confirmDeletePlan = (plan: FeePlan) => {
    setPlanToDelete(plan);
  };
  
  const handleRecordPayment = (plan: FeePlan) => {
    setSelectedPlanForPayment(plan);
  };
  
  const isLoading = isLoadingPlans || isLoadingPayments;
  const isPending = isPendingCreate || isPendingUpdate || isPendingDelete;
  
  return (
    

    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fee Plans</h3>
        <Button 
          onClick={() => setIsAddingPlan(true)} 
          size="sm" 
          disabled={isLoading || isPending}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Fee Plan
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-4 text-center text-muted-foreground">Loading fee plans...</div>
      ) : feePlans.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <p>No fee plans have been created for this student yet.</p>
            <Button 
              onClick={() => setIsAddingPlan(true)} 
              variant="outline" 
              className="mt-4"
              disabled={isPending}
            >
              Create First Fee Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feePlans.map((plan) => {
            const planPayments = payments.filter(p => p.fee_plan_id === plan.id);
            const summary = calculateFeePlanSummary(plan, planPayments);
            const dueStatus = formatDueStatus(summary);
            // Use 'default' for 'warning' as a fallback since 'warning' may not be a supported variant
            const statusVariant = getStatusBadgeVariant(dueStatus);
            
            return (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{plan.plan_title}</CardTitle>
                      <CardDescription>
                        Total: ${plan.total_amount.toFixed(2)} | 
                        Due Dates: {plan.due_dates.length}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant}>
                        {dueStatus}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => handleRecordPayment(plan)}>
                              <BanknoteIcon className="h-4 w-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => confirmDeletePlan(plan)}
                              className="text-destructive focus:text-destructive"
                            >
                              Delete Plan
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Paid Amount</p>
                        <p className="text-lg font-medium text-green-600">${summary.paidAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Amount</p>
                        <p className="text-lg font-medium text-amber-600">${summary.dueAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${summary.paymentPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-right mt-1">{summary.paymentPercentage.toFixed(1)}% paid</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Due Date</p>
                        <p className="text-sm font-medium">
                          {summary.nextDueDate ? (
                            <>
                              {new Date(summary.nextDueDate.date).toLocaleDateString()}: 
                              ${summary.nextDueDate.amount.toFixed(2)}
                            </>
                          ) : 'No upcoming due dates'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4 mt-2">
                  <div className="w-full grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => handleRecordPayment(plan)} 
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-1"
                      disabled={isPending}
                    >
                      <BanknoteIcon className="h-4 w-4" />
                      Record Payment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-1"
                      disabled={isPending}
                      // This would link to a payment history view in a real app
                    >
                      <ReceiptIcon className="h-4 w-4" />
                      View Payments
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Add Fee Plan Dialog */}
      <Dialog open={isAddingPlan} onOpenChange={setIsAddingPlan}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Fee Plan</DialogTitle>
            <DialogDescription>
              Create a new fee plan for this student with payment schedule.
            </DialogDescription>
          </DialogHeader>
          
          <FeePlanForm
            studentId={studentId}
            onSubmit={handleCreatePlan}
            onCancel={() => setIsAddingPlan(false)}
            isPending={isPendingCreate}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Fee Plan Dialog */}
      <Dialog open={!!isEditingPlan} onOpenChange={(open) => !open && setIsEditingPlan(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Fee Plan</DialogTitle>
            <DialogDescription>
              Update the fee plan details and payment schedule.
            </DialogDescription>
          </DialogHeader>
          
          {isEditingPlan && (
            <FeePlanForm
              studentId={studentId}
              initialData={isEditingPlan}
              onSubmit={handleUpdatePlan}
              onCancel={() => setIsEditingPlan(null)}
              isPending={isPendingUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Record Payment Dialog */}
      <Dialog open={!!selectedPlanForPayment} onOpenChange={(open) => !open && setSelectedPlanForPayment(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a new payment for this fee plan.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlanForPayment && (
            <PaymentForm
              studentId={studentId}
              feePlanId={selectedPlanForPayment.id}
              onSubmit={() => {
                // This will be handled by the PaymentForm component using the usePayments hook
                setSelectedPlanForPayment(null);
              }}
              onCancel={() => setSelectedPlanForPayment(null)}
              isPending={false}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the fee plan "{planToDelete?.plan_title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
