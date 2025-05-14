
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
}
