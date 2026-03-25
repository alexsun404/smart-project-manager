export interface Project {
  id: string; name: string; description: string | null;
  status: 'planning' | 'active' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string | null; end_date: string | null;
  progress: number; budget: number | null;
  tags: string[]; metadata: Record<string, unknown> | null;
  created_at: string; updated_at: string | null;
}

export interface Task {
  id: string; project_id: string; parent_id: string | null;
  title: string; description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id: string | null; start_date: string | null; due_date: string | null;
  completed_at: string | null; estimated_hours: number | null; actual_hours: number | null;
  tags: string[]; attachments: string[]; metadata: Record<string, unknown> | null;
  created_at: string; updated_at: string | null;
}

export interface Milestone {
  id: string; project_id: string; title: string; description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null; completed_at: string | null; progress: number;
  metadata: Record<string, unknown> | null;
  created_at: string; updated_at: string | null;
}

export interface Deliverable {
  id: string; project_id: string; milestone_id: string | null; task_id: string | null;
  title: string; description: string | null; type: string;
  file_url: string | null; file_name: string | null; file_size: number | null;
  tags: string[]; version: string | null; metadata: Record<string, unknown> | null;
  created_at: string; updated_at: string | null;
}

export interface TeamMember {
  id: string; user_id: string; project_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  name: string; email: string; avatar: string | null;
  department: string | null; position: string | null;
  permissions: string[]; is_active: boolean; joined_at: string;
  created_at: string; updated_at: string | null;
}

export interface TaskComment {
  id: string; task_id: string; user_id: string; user_name: string;
  content: string; parent_id: string | null; attachments: string[];
  created_at: string; updated_at: string | null;
}

export interface ProjectActivity {
  id: string; project_id: string; type: string; title: string;
  description: string | null; user_id: string | null; user_name: string | null;
  metadata: Record<string, unknown> | null; created_at: string;
}

export interface ApiResponse<T> { data: T; error?: string; }
