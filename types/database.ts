export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole =
  | "Administrator"
  | "Physician"
  | "Nurse"
  | "Medical Assistant"
  | "Front Desk"
  | "Office Manager"
  | "Scheduler"
  | "Therapist"
  | "Patient Coordinator"
  | "Referral Coordinator"
  | "Care Coordinator"
  | "SNF Coordinator"
  | "Records Coordinator"
  | "Operations Lead"
  | "Receptionist";

export type TaskStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Overdue";

export type TaskPriority = "Low" | "Medium" | "High";
export type ScheduleEventType = "Clinic" | "SNF" | "Staff Shift" | "Admin";
export type ChatType = "Direct" | "Group";

type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      organizations: TableDefinition<
        {
          id: string;
          name: string;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          created_at?: string;
        }
      >;
      user_profiles: TableDefinition<
        {
          id: string;
          organization_id: string | null;
          email: string;
          full_name: string | null;
          role: AppRole;
          department: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          organization_id?: string | null;
          email: string;
          full_name?: string | null;
          role?: AppRole;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          organization_id?: string | null;
          email?: string;
          full_name?: string | null;
          role?: AppRole;
          department?: string | null;
          updated_at?: string;
        }
      >;
      appointments: TableDefinition<
        {
          id: string;
          organization_id: string;
          title: string;
          appointment_time: string;
          provider_name: string | null;
          department: string | null;
          status: string;
          reminder_status: string;
          forms_status: string;
          insurance_status: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          title: string;
          appointment_time: string;
          provider_name?: string | null;
          department?: string | null;
          status?: string;
          reminder_status?: string;
          forms_status?: string;
          insurance_status?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      tasks: TableDefinition<
        {
          id: string;
          organization_id: string;
          title: string;
          description: string;
          assigned_staff: string | null;
          department: string | null;
          priority: TaskPriority;
          due_at: string | null;
          status: TaskStatus;
          notes: string;
          completion_timestamp: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          title: string;
          description?: string;
          assigned_staff?: string | null;
          department?: string | null;
          priority?: TaskPriority;
          due_at?: string | null;
          status?: TaskStatus;
          notes?: string;
          completion_timestamp?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          title?: string;
          description?: string;
          assigned_staff?: string | null;
          department?: string | null;
          priority?: TaskPriority;
          due_at?: string | null;
          status?: TaskStatus;
          notes?: string;
          completion_timestamp?: string | null;
          updated_at?: string;
        }
      >;
      schedule_events: TableDefinition<
        {
          id: string;
          organization_id: string;
          title: string;
          owner: string;
          starts_at: string;
          ends_at: string | null;
          event_type: ScheduleEventType;
          location: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          title: string;
          owner: string;
          starts_at: string;
          ends_at?: string | null;
          event_type?: ScheduleEventType;
          location?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      conversations: TableDefinition<
        {
          id: string;
          organization_id: string;
          name: string;
          chat_type: ChatType;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          name: string;
          chat_type?: ChatType;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      conversation_members: TableDefinition<
        {
          conversation_id: string;
          user_id: string;
          created_at: string;
        },
        {
          conversation_id: string;
          user_id: string;
          created_at?: string;
        }
      >;
      messages: TableDefinition<
        {
          id: string;
          organization_id: string;
          conversation_id: string;
          author_id: string | null;
          body: string;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          conversation_id: string;
          author_id?: string | null;
          body: string;
          created_at?: string;
        }
      >;
      ai_summary_drafts: TableDefinition<
        {
          id: string;
          organization_id: string;
          conversation_id: string | null;
          summary: string;
          suggested_action: string | null;
          suggested_priority: TaskPriority | null;
          suggested_role: AppRole | null;
          suggested_due_at: string | null;
          reviewed_by: string | null;
          approved_task_id: string | null;
          created_at: string;
          reviewed_at: string | null;
        },
        {
          id?: string;
          organization_id: string;
          conversation_id?: string | null;
          summary: string;
          suggested_action?: string | null;
          suggested_priority?: TaskPriority | null;
          suggested_role?: AppRole | null;
          suggested_due_at?: string | null;
          reviewed_by?: string | null;
          approved_task_id?: string | null;
          created_at?: string;
          reviewed_at?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      current_user_organization_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      current_user_role: {
        Args: Record<string, never>;
        Returns: AppRole | null;
      };
      is_admin_role: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_same_org: {
        Args: { row_organization_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      task_status: TaskStatus;
      task_priority: TaskPriority;
      schedule_event_type: ScheduleEventType;
      chat_type: ChatType;
    };
    CompositeTypes: Record<string, never>;
  };
};
