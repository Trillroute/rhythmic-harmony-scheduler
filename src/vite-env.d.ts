
/// <reference types="vite/client" />

// Add additional global type definitions
declare type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Add PaymentStatus type since it's missing
declare type PaymentStatus = "paid" | "pending" | "overdue" | "partial";

// Add FeePlanSummary interface to match what's used in FeePlanDetails
interface FeePlanSummary {
  paidAmount: number;
  dueAmount: number;
  paymentPercentage: number;
  nextDueDate: {
    date: string | Date;
    amount: number;
  } | null;
  status: PaymentStatus;
}
