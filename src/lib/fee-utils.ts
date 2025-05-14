
import { FeePlan, DueDate } from "@/hooks/use-fee-plans";
import { Payment } from "@/hooks/use-payments";
import { formatDistanceToNow } from "date-fns";

export type PaymentStatus = "paid" | "pending" | "overdue" | "partially_paid";

export interface FeePlanSummary {
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  nextDueDate?: Date | null;
  nextDueAmount?: number;
  status: PaymentStatus;
  lateFee: number;
  daysOverdue: number;
}

export const calculateFeePlanSummary = (plan: FeePlan, payments: Payment[]): FeePlanSummary => {
  const totalAmount = plan.total_amount;
  const amountPaid = payments.reduce((sum, payment) => sum + payment.amount_paid, 0);
  const remainingAmount = totalAmount - amountPaid;
  
  // Sort due dates in ascending order
  const sortedDueDates = [...plan.due_dates].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Find next due date
  const now = new Date();
  let nextDueDate: Date | null = null;
  let nextDueAmount = 0;
  let lateFee = 0;
  let daysOverdue = 0;
  
  // Find the earliest unpaid or partially paid due date
  const totalPaidSoFar = payments.reduce((sum, payment) => sum + payment.amount_paid, 0);
  let runningTotal = 0;
  
  for (const dueDate of sortedDueDates) {
    runningTotal += dueDate.amount;
    const dateObj = new Date(dueDate.date);
    
    // If we haven't paid enough to cover up to this due date
    if (totalPaidSoFar < runningTotal) {
      const unpaidForThisDate = runningTotal - totalPaidSoFar;
      
      if (!nextDueDate || dateObj < nextDueDate) {
        nextDueDate = dateObj;
        nextDueAmount = unpaidForThisDate;
      }
      
      // Calculate late fee if this due date is in the past
      if (dateObj < now && plan.late_fee_policy) {
        const daysPastDue = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysPastDue > 0) {
          const calculatedLateFee = Math.min(
            daysPastDue * plan.late_fee_policy.rate_per_day * unpaidForThisDate,
            plan.late_fee_policy.maximum
          );
          
          if (calculatedLateFee > lateFee) {
            lateFee = calculatedLateFee;
            daysOverdue = daysPastDue;
          }
        }
      }
    }
  }
  
  // Determine overall status
  let status: PaymentStatus = "paid";
  
  if (remainingAmount > 0) {
    if (nextDueDate && nextDueDate < now) {
      status = "overdue";
    } else if (amountPaid > 0) {
      status = "partially_paid";
    } else {
      status = "pending";
    }
  }
  
  return {
    totalAmount,
    amountPaid,
    remainingAmount,
    nextDueDate,
    nextDueAmount,
    status,
    lateFee,
    daysOverdue
  };
};

export const getStatusBadgeVariant = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
      return "success";
    case "partially_paid":
      return "warning";
    case "pending":
      return "outline";
    case "overdue":
      return "destructive";
    default:
      return "secondary";
  }
};

export const formatDueStatus = (dueDate: Date | null | undefined, status: PaymentStatus): string => {
  if (!dueDate) return "No upcoming due date";
  
  if (status === "paid") {
    return "Fully paid";
  }
  
  const now = new Date();
  if (dueDate < now) {
    return `Overdue by ${formatDistanceToNow(dueDate)}`;
  }
  
  return `Due in ${formatDistanceToNow(dueDate)}`;
};
