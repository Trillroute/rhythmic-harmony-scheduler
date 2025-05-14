
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFeePlans, FeePlan } from "@/hooks/use-fee-plans";
import { usePayments } from "@/hooks/use-payments";
import { FeePlanForm } from "./FeePlanForm";
import { PaymentForm } from "./PaymentForm";
import { PlusIcon, Pencil2Icon, ReceiptIcon, MoreVertical, BanknoteIcon } from "lucide-react";
import { calculateFeePlanSummary, formatDueStatus, getStatusBadgeVariant } from "@/lib/fee-utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface FeePlanDetailsProps {
  studentId: string;
}

export const FeePlanDetails: React.FC<FeePlanDetailsProps> = ({ studentId }) => {
  const { feePlans, createFeePlan, updateFeePlan, deleteFeePlan, isLoading: isLoadingPlans, isPendingCreate, isPendingUpdate, isPendingDelete } = useFeePlans(studentId);
  
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState<FeePlan | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<FeePlan | null>(null);
  const [selectedPlanForDelete, setSelectedPlanForDelete] = useState<FeePlan | null>(null);

  // Calculate summaries for all fee plans
  const feePlanSummaries = feePlans.map(plan => {
    // Get payments for this plan
    const { payments } = usePayments(studentId, plan.id);
    const summary = calculateFeePlanSummary(plan, payments);
    return {
      plan,
      summary,
      payments
    };
  });

  const handleAddPlan = () => {
    setIsAddingPlan(true);
  };

  const handleEditPlan = (plan: FeePlan) => {
    setIsEditingPlan(plan);
  };

  const handleDeletePlan = (plan: FeePlan) => {
    setSelectedPlanForDelete(plan);
  };

  const confirmDeletePlan = () => {
    if (selectedPlanForDelete) {
      deleteFeePlan(selectedPlanForDelete.id);
      setSelectedPlanForDelete(null);
    }
  };

  const handleAddPayment = (plan: FeePlan) => {
    setSelectedPlanForPayment(plan);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Fee Plans</h2>
        <Dialog open={isAddingPlan} onOpenChange={setIsAddingPlan}>
          <DialogTrigger asChild>
            <Button onClick={handleAddPlan}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Fee Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <FeePlanForm
              studentId={studentId}
              onSubmit={(data) => {
                createFeePlan(data);
                setIsAddingPlan(false);
              }}
              onCancel={() => setIsAddingPlan(false)}
              isPending={isPendingCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingPlans ? (
        <div className="flex justify-center p-8">
          <p className="text-muted-foreground">Loading fee plans...</p>
        </div>
      ) : feePlanSummaries.length > 0 ? (
        <div className="space-y-4">
          {feePlanSummaries.map(({ plan, summary, payments }) => (
            <Card key={plan.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{plan.plan_title}</CardTitle>
                    <CardDescription>
                      Created on {format(new Date(plan.created_at), "PPP")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={getStatusBadgeVariant(summary.status)} className="mr-2">
                      {summary.status === "partially_paid" ? "Partially Paid" : 
                       summary.status === "overdue" ? "Overdue" :
                       summary.status === "pending" ? "Pending" : "Paid"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => handleAddPayment(plan)}>
                            <BanknoteIcon className="h-4 w-4 mr-2" />
                            Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                            <Pencil2Icon className="h-4 w-4 mr-2" />
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeletePlan(plan)}
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

              <CardContent className="p-0">
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-semibold">₹{summary.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid / Remaining</p>
                    <p className="text-xl">
                      <span className="font-semibold text-green-600">₹{summary.amountPaid.toLocaleString()}</span>
                      <span className="mx-1">/</span>
                      <span className="font-semibold text-gray-600">₹{summary.remainingAmount.toLocaleString()}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <p className="text-lg font-semibold">
                      {formatDueStatus(summary.nextDueDate, summary.status)}
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="due-dates">
                    <AccordionTrigger className="px-4">Due Dates</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {plan.due_dates.map((dueDate, index) => (
                              <TableRow key={index}>
                                <TableCell>{format(new Date(dueDate.date), "PPP")}</TableCell>
                                <TableCell>₹{dueDate.amount.toLocaleString()}</TableCell>
                                <TableCell>{dueDate.description || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payments">
                    <AccordionTrigger className="px-4">
                      <span className="flex items-center">
                        Payment History
                        <Badge variant="outline" className="ml-2">
                          {payments.length}
                        </Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {payments.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Mode</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                  <TableCell>{format(new Date(payment.paid_at), "PPP")}</TableCell>
                                  <TableCell>₹{payment.amount_paid.toLocaleString()}</TableCell>
                                  <TableCell>{payment.payment_mode}</TableCell>
                                  <TableCell>{payment.notes || "-"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center p-4 border border-dashed rounded-md">
                          <p className="text-muted-foreground">No payments recorded yet</p>
                          <Button variant="outline" className="mt-2" onClick={() => handleAddPayment(plan)}>
                            <BanknoteIcon className="h-4 w-4 mr-2" />
                            Record Payment
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {plan.late_fee_policy && summary.daysOverdue > 0 && (
                    <AccordionItem value="late-fees">
                      <AccordionTrigger className="px-4">
                        <span className="flex items-center">
                          Late Fees
                          <Badge variant="destructive" className="ml-2">
                            ₹{summary.lateFee.toLocaleString()}
                          </Badge>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="p-4 bg-red-50 rounded-md">
                          <p className="text-red-600">
                            {summary.daysOverdue} days overdue - Late fee of ₹{summary.lateFee.toLocaleString()} applies
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Rate: {plan.late_fee_policy.rate_per_day}% per day, 
                            Max: ₹{plan.late_fee_policy.maximum.toLocaleString()}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>

                {summary.remainingAmount > 0 && (
                  <div className="p-4 flex justify-end border-t">
                    <Button onClick={() => handleAddPayment(plan)} variant="default">
                      <BanknoteIcon className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <ReceiptIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Fee Plans</h3>
            <p className="text-muted-foreground text-center mb-4">
              This student doesn't have any fee plans set up yet.
            </p>
            <Button onClick={handleAddPlan}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Fee Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit plan dialog */}
      <Dialog open={!!isEditingPlan} onOpenChange={(open) => !open && setIsEditingPlan(null)}>
        <DialogContent className="max-w-3xl">
          {isEditingPlan && (
            <FeePlanForm
              studentId={studentId}
              initialData={isEditingPlan}
              onSubmit={(data) => {
                updateFeePlan({
                  id: isEditingPlan.id,
                  ...data
                });
                setIsEditingPlan(null);
              }}
              onCancel={() => setIsEditingPlan(null)}
              isPending={isPendingUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add payment dialog */}
      <Dialog open={!!selectedPlanForPayment} onOpenChange={(open) => !open && setSelectedPlanForPayment(null)}>
        <DialogContent>
          {selectedPlanForPayment && (
            <PaymentForm
              studentId={studentId}
              feePlanId={selectedPlanForPayment.id}
              onSubmit={(data) => {
                const { payments } = usePayments(studentId, selectedPlanForPayment.id);
                const summary = calculateFeePlanSummary(selectedPlanForPayment, payments);
                
                createPayment(data);
                setSelectedPlanForPayment(null);
              }}
              onCancel={() => setSelectedPlanForPayment(null)}
              isPending={isPendingCreate}
              maxAmount={calculateFeePlanSummary(selectedPlanForPayment, []).remainingAmount}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <AlertDialog open={!!selectedPlanForDelete} onOpenChange={(open) => !open && setSelectedPlanForDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the fee plan "{selectedPlanForDelete?.plan_title}" and all associated payment records.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
