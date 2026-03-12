export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type FileAttachment = {
  name: string;
  size: string;
  type: string;
  url:  string;   // public URL from Supabase Storage
  path: string;   // storage path for deletion
};

export type ProjectStatus =
  | "Ready to work"
  | "In Progress"
  | "Under Review"
  | "Completed"
  | "Parked";

export type ApprovalStatus = "pending" | "approved" | "changes_requested";
export type MessageRole    = "freelancer" | "client";

export interface Project {
  id:           string;
  owner_id:     string;
  share_token:  string;
  name:         string;
  client_name:  string | null;
  client_email: string | null;
  status:       ProjectStatus;
  deadline:     string | null;   // ISO date
  amount:       number | null;
  description:  string | null;
  is_contract:  boolean;
  created_at:   string;
  updated_at:   string;
}

export interface Message {
  id:          string;
  project_id:  string;
  role:        MessageRole;
  author_name: string;
  body:        string | null;
  files:       FileAttachment[];
  created_at:  string;
}

export interface Approval {
  id:          string;
  project_id:  string;
  title:       string;
  description: string | null;
  status:      ApprovalStatus;
  client_note: string | null;   // note from client when requesting changes
  files:       FileAttachment[];
  created_at:  string;
  updated_at:  string;
}

// Supabase Database shape (used for typed client)
export interface Database {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  public: {
    Tables: {
      customers: {
        Row:    { id: string; owner_id: string; dodo_customer_id: string | null; dodo_subscription_id: string | null; plan: string; plan_period_end: string | null; created_at: string; updated_at: string };
        Insert: { owner_id: string; dodo_customer_id?: string | null; dodo_subscription_id?: string | null; plan?: string; plan_period_end?: string | null };
        Update: { dodo_customer_id?: string | null; dodo_subscription_id?: string | null; plan?: string; plan_period_end?: string | null };
        Relationships: [];
      };
      projects:  {
        Row:    Project;
        Insert: Omit<Project, "id"|"share_token"|"created_at"|"updated_at"> & { status?: ProjectStatus; is_contract?: boolean };
        Update: Partial<Omit<Project, "id"|"owner_id">>;
        Relationships: [];
      };
      messages:  {
        Row:    Message;
        Insert: Omit<Message, "id"|"created_at"> & { files?: FileAttachment[] };
        Update: Partial<Omit<Message, "id"|"project_id"|"created_at">>;
        Relationships: [];
      };
      approvals: {
        Row:    Approval;
        Insert: Omit<Approval, "id"|"created_at"|"updated_at"> & { status?: ApprovalStatus; client_note?: string | null };
        Update: Partial<Pick<Approval, "status"|"client_note"|"title"|"description">>;
        Relationships: [];
      };
    };
    Views:          Record<string, never>;
    Functions:      Record<string, never>;
    Enums:          Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
