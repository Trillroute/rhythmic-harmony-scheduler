
/// <reference types="vite/client" />

// Add additional global type definitions
declare type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Update PaymentStatus type to include 'warning' for use in getStatusBadgeVariant function
declare type PaymentStatus = "paid" | "pending" | "overdue" | "partial" | "warning";

// Updated FeePlanSummary interface to match what's used in FeePlanDetails
interface FeePlanSummary {
  paid_amount: number;
  due_amount: number;
  payment_percentage: number;
  next_due_date: {
    date: string | Date;
    amount: number;
  } | null;
  status: PaymentStatus;
  // Add these properties with camelCase naming
  paidAmount: number;
  dueAmount: number;
  paymentPercentage: number;
  nextDueDate: {
    date: string | Date;
    amount: number;
  } | null;
}
