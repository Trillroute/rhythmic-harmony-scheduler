
import type { FeePlan } from "@/hooks/use-fee-plans";
import type { Payment } from "@/hooks/use-payments";

export function calculateFeePlanSummary(plan: FeePlan, payments: Payment[]): FeePlanSummary {
  // Calculate total amount paid
  const paidAmount = payments.reduce((sum, payment) => sum + Number(payment.amount_paid), 0);
  
  // Calculate remaining amount due
  const dueAmount = plan.total_amount - paidAmount;
  
  // Calculate payment percentage
  const paymentPercentage = plan.total_amount > 0 
    ? (paidAmount / plan.total_amount) * 100 
    : 0;
  
  // Find next due date
  let nextDueDate = null;
  const now = new Date();
  
  const upcomingDueDates = plan.due_dates
    .filter(dd => new Date(dd.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (upcomingDueDates.length > 0) {
    nextDueDate = upcomingDueDates[0];
  }
  
  // Determine status
  let status: PaymentStatus = "pending";
  if (paymentPercentage >= 100) {
    status = "paid";
  } else if (paymentPercentage > 0) {
    status = "partial";
  }
  
  // Check for overdue payments
  const overdueDates = plan.due_dates
    .filter(dd => new Date(dd.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (paymentPercentage < 100 && overdueDates.length > 0) {
    status = "overdue";
  }
  
  return {
    paid_amount: paidAmount,
    due_amount: dueAmount,
    payment_percentage: paymentPercentage,
    next_due_date: nextDueDate,
    status,
    // Add camelCase versions for backward compatibility
    paidAmount,
    dueAmount,
    paymentPercentage,
    nextDueDate
  };
}

export function formatDueStatus(summary: FeePlanSummary): string {
  if (summary.status === "paid") {
    return "Paid";
  } else if (summary.status === "overdue") {
    return "Overdue";
  } else if (summary.status === "partial") {
    return "Partially Paid";
  } else {
    return "Pending";
  }
}

// Modify to support 'warning' as a valid variant
export function getStatusBadgeVariant(status: string): "default" | "outline" | "secondary" | "destructive" | "success" {
  switch (status) {
    case "Paid":
      return "success";
    case "Overdue":
      return "destructive";
    case "Partially Paid":
      return "secondary";
    case "Pending": 
      return "outline";
    default:
      // Use 'default' instead of 'warning' since 'warning' is not a valid variant
      return "default";
  }
}
