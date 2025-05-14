export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          permissions: string[] | null
        }
        Insert: {
          id: string
          permissions?: string[] | null
        }
        Update: {
          id?: string
          permissions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_events: {
        Row: {
          created_at: string
          id: string
          marked_at: string
          marked_by_user_id: string
          notes: string | null
          session_id: string
          status: Database["public"]["Enums"]["attendance_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          marked_at?: string
          marked_by_user_id: string
          notes?: string | null
          session_id: string
          status: Database["public"]["Enums"]["attendance_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          marked_at?: string
          marked_by_user_id?: string
          notes?: string | null
          session_id?: string
          status?: Database["public"]["Enums"]["attendance_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_events_marked_by_user_id_fkey"
            columns: ["marked_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          file_type: string
          file_url: string | null
          id: string
          is_public: boolean
          module_number: number | null
          session_number: number | null
          storage_path: string | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          file_type: string
          file_url?: string | null
          id?: string
          is_public?: boolean
          module_number?: number | null
          session_number?: number | null
          storage_path?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          file_type?: string
          file_url?: string | null
          id?: string
          is_public?: boolean
          module_number?: number | null
          session_number?: number | null
          storage_path?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_materials_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_teachers: {
        Row: {
          course_id: string
          created_at: string
          teacher_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          teacher_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_teachers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration_type: string
          duration_value: number
          id: string
          instrument: Database["public"]["Enums"]["subject_type_enum"]
          name: string
          session_duration: number
          session_type: Database["public"]["Enums"]["session_type_enum"]
          status: string
          syllabus: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_type: string
          duration_value: number
          id?: string
          instrument: Database["public"]["Enums"]["subject_type_enum"]
          name: string
          session_duration: number
          session_type: Database["public"]["Enums"]["session_type_enum"]
          status?: string
          syllabus?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_type?: string
          duration_value?: number
          id?: string
          instrument?: Database["public"]["Enums"]["subject_type_enum"]
          name?: string
          session_duration?: number
          session_type?: Database["public"]["Enums"]["session_type_enum"]
          status?: string
          syllabus?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          plan_id: string | null
          start_date: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          start_date: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          start_date?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "session_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          notes: string | null
          pack_id: string | null
          plan_id: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          pack_id?: string | null
          plan_id?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          pack_id?: string | null
          plan_id?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "session_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "session_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          recorded_by_user_id: string
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date: string
          payment_method: string
          recorded_by_user_id: string
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          recorded_by_user_id?: string
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_records_recorded_by_user_id_fkey"
            columns: ["recorded_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          channel: string
          created_at: string
          id: string
          message: string
          recipient_id: string
          related_id: string | null
          send_at: string
          sent_at: string | null
          status: string
          type: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          message: string
          recipient_id: string
          related_id?: string | null
          send_at: string
          sent_at?: string | null
          status?: string
          type: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          message?: string
          recipient_id?: string
          related_id?: string | null
          send_at?: string
          sent_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reschedule_history: {
        Row: {
          created_at: string
          id: string
          new_date_time: string
          original_date_time: string
          reason: string
          rescheduled_at: string
          rescheduled_by_user_id: string
          session_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_date_time: string
          original_date_time: string
          reason: string
          rescheduled_at?: string
          rescheduled_by_user_id: string
          session_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          new_date_time?: string
          original_date_time?: string
          reason?: string
          rescheduled_at?: string
          rescheduled_by_user_id?: string
          session_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reschedule_history_rescheduled_by_user_id_fkey"
            columns: ["rescheduled_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_packs: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          is_active: boolean
          location: Database["public"]["Enums"]["location_type_enum"]
          purchased_date: string
          remaining_sessions: number
          session_type: Database["public"]["Enums"]["session_type_enum"]
          size: Database["public"]["Enums"]["pack_size_enum"]
          student_id: string
          subject: Database["public"]["Enums"]["subject_type_enum"]
          updated_at: string
          weekly_frequency: Database["public"]["Enums"]["weekly_frequency_enum"]
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          location: Database["public"]["Enums"]["location_type_enum"]
          purchased_date?: string
          remaining_sessions: number
          session_type: Database["public"]["Enums"]["session_type_enum"]
          size: Database["public"]["Enums"]["pack_size_enum"]
          student_id: string
          subject: Database["public"]["Enums"]["subject_type_enum"]
          updated_at?: string
          weekly_frequency: Database["public"]["Enums"]["weekly_frequency_enum"]
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          location?: Database["public"]["Enums"]["location_type_enum"]
          purchased_date?: string
          remaining_sessions?: number
          session_type?: Database["public"]["Enums"]["session_type_enum"]
          size?: Database["public"]["Enums"]["pack_size_enum"]
          student_id?: string
          subject?: Database["public"]["Enums"]["subject_type_enum"]
          updated_at?: string
          weekly_frequency?: Database["public"]["Enums"]["weekly_frequency_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "session_packs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      session_plans: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          sessions_count: number
          status: string
          updated_at: string
          validity_days: number
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          sessions_count: number
          status?: string
          updated_at?: string
          validity_days: number
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          sessions_count?: number
          status?: string
          updated_at?: string
          validity_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_plans_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      session_students: {
        Row: {
          session_id: string
          student_id: string
        }
        Insert: {
          session_id: string
          student_id: string
        }
        Update: {
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_students_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          date_time: string
          duration: number
          id: string
          location: Database["public"]["Enums"]["location_type_enum"]
          notes: string | null
          pack_id: string
          reschedule_count: number
          session_type: Database["public"]["Enums"]["session_type_enum"]
          status: Database["public"]["Enums"]["attendance_status_enum"]
          subject: Database["public"]["Enums"]["subject_type_enum"]
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_time: string
          duration: number
          id?: string
          location: Database["public"]["Enums"]["location_type_enum"]
          notes?: string | null
          pack_id: string
          reschedule_count?: number
          session_type: Database["public"]["Enums"]["session_type_enum"]
          status?: Database["public"]["Enums"]["attendance_status_enum"]
          subject: Database["public"]["Enums"]["subject_type_enum"]
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_time?: string
          duration?: number
          id?: string
          location?: Database["public"]["Enums"]["location_type_enum"]
          notes?: string | null
          pack_id?: string
          reschedule_count?: number
          session_type?: Database["public"]["Enums"]["session_type_enum"]
          status?: Database["public"]["Enums"]["attendance_status_enum"]
          subject?: Database["public"]["Enums"]["subject_type_enum"]
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "session_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          completion_percentage: number
          created_at: string
          enrollment_id: string
          id: string
          last_updated_by: string
          module_number: number | null
          session_number: number | null
          student_notes: string | null
          teacher_notes: string | null
          updated_at: string
        }
        Insert: {
          completion_percentage?: number
          created_at?: string
          enrollment_id: string
          id?: string
          last_updated_by: string
          module_number?: number | null
          session_number?: number | null
          student_notes?: string | null
          teacher_notes?: string | null
          updated_at?: string
        }
        Update: {
          completion_percentage?: number
          created_at?: string
          enrollment_id?: string
          id?: string
          last_updated_by?: string
          module_number?: number | null
          session_number?: number | null
          student_notes?: string | null
          teacher_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          id: string
          notes: string | null
          preferred_subjects: Database["public"]["Enums"]["subject_type_enum"][]
          preferred_teachers: string[] | null
        }
        Insert: {
          id: string
          notes?: string | null
          preferred_subjects?: Database["public"]["Enums"]["subject_type_enum"][]
          preferred_teachers?: string[] | null
        }
        Update: {
          id?: string
          notes?: string | null
          preferred_subjects?: Database["public"]["Enums"]["subject_type_enum"][]
          preferred_teachers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      teachers: {
        Row: {
          id: string
          max_weekly_sessions: number | null
          subjects: Database["public"]["Enums"]["subject_type_enum"][]
        }
        Insert: {
          id: string
          max_weekly_sessions?: number | null
          subjects?: Database["public"]["Enums"]["subject_type_enum"][]
        }
        Update: {
          id?: string
          max_weekly_sessions?: number | null
          subjects?: Database["public"]["Enums"]["subject_type_enum"][]
        }
        Relationships: [
          {
            foreignKeyName: "teachers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          created_at: string
          day: number
          end_time: string
          id: string
          is_recurring: boolean
          location: Database["public"]["Enums"]["location_type_enum"]
          start_time: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day: number
          end_time: string
          id?: string
          is_recurring?: boolean
          location: Database["public"]["Enums"]["location_type_enum"]
          start_time: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day?: number
          end_time?: string
          id?: string
          is_recurring?: boolean
          location?: Database["public"]["Enums"]["location_type_enum"]
          start_time?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_student: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_teacher: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      attendance_status_enum:
        | "Present"
        | "Cancelled by Student"
        | "Cancelled by Teacher"
        | "Cancelled by School"
        | "Scheduled"
      location_type_enum: "Online" | "Offline"
      pack_size_enum: "4" | "10" | "20" | "30"
      session_type_enum: "Solo" | "Duo" | "Focus"
      subject_type_enum: "Guitar" | "Piano" | "Drums" | "Ukulele" | "Vocal"
      user_role_enum: "admin" | "teacher" | "student"
      weekly_frequency_enum: "once" | "twice"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendance_status_enum: [
        "Present",
        "Cancelled by Student",
        "Cancelled by Teacher",
        "Cancelled by School",
        "Scheduled",
      ],
      location_type_enum: ["Online", "Offline"],
      pack_size_enum: ["4", "10", "20", "30"],
      session_type_enum: ["Solo", "Duo", "Focus"],
      subject_type_enum: ["Guitar", "Piano", "Drums", "Ukulele", "Vocal"],
      user_role_enum: ["admin", "teacher", "student"],
      weekly_frequency_enum: ["once", "twice"],
    },
  },
} as const
