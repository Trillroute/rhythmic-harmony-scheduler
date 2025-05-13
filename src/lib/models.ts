
import { SubjectType, SessionType, LocationType, AttendanceStatus, PackSize, WeeklyFrequency, UserRole } from "./types";

// Course Management Types
export interface Course {
  id: string;
  name: string;
  description?: string;
  instrument: SubjectType;
  session_type: SessionType;
  duration_type: "weeks" | "sessions";
  duration_value: number;
  session_duration: number;
  syllabus?: string;
  status: "active" | "inactive" | "archived";
  created_at: Date;
  updated_at: Date;
}

export interface SessionPlan {
  id: string;
  name: string;
  description?: string;
  course_id?: string;
  price: number;
  sessions_count: number;
  validity_days: number;
  status: "active" | "inactive" | "archived";
  created_at: Date;
  updated_at: Date;
}

export interface CourseTeacher {
  course_id: string;
  teacher_id: string;
  created_at: Date;
}

// Fee Collection Types
export interface Invoice {
  id: string;
  student_id: string;
  plan_id?: string;
  pack_id?: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  due_date: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: Date;
  payment_method: "cash" | "upi" | "card" | "bank_transfer" | "other";
  reference_number?: string;
  recorded_by_user_id: string;
  notes?: string;
  created_at: Date;
}

// Learning Materials Types
export interface CourseMaterial {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  file_type: "pdf" | "video" | "link" | "image" | "audio" | "other";
  file_url?: string;
  storage_path?: string;
  uploaded_by: string;
  created_at: Date;
  updated_at: Date;
  module_number?: number;
  session_number?: number;
  is_public: boolean;
}

// Student Progress Types
export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  plan_id?: string;
  start_date: Date;
  end_date?: Date;
  status: "active" | "on_hold" | "completed" | "cancelled";
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StudentProgress {
  id: string;
  enrollment_id: string;
  module_number?: number;
  session_number?: number;
  completion_percentage: number;
  teacher_notes?: string;
  student_notes?: string;
  last_updated_by: string;
  created_at: Date;
  updated_at: Date;
}

// Reminder Types
export interface Reminder {
  id: string;
  type: "session" | "payment" | "enrollment" | "other";
  recipient_id: string;
  related_id?: string;
  message: string;
  send_at: Date;
  sent_at?: Date;
  status: "pending" | "sent" | "failed" | "cancelled";
  channel: "email" | "in_app" | "sms" | "push";
  created_at: Date;
}

// Extended filter options
export interface ExtendedFilterOptions {
  teachers?: string[];
  students?: string[];
  subjects?: SubjectType[];
  sessionTypes?: SessionType[];
  locations?: LocationType[];
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus[];
  courseIds?: string[];
  planIds?: string[];
  paymentStatus?: string[];
}
