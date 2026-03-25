const API_BASE = '/api';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  searchParams?: Record<string, string>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, searchParams } = options;
  let url = `${API_BASE}${endpoint}`;
  if (searchParams) { url += `?${new URLSearchParams(searchParams).toString()}`; }
  const fetchOptions: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
  if (body && method !== 'GET') { fetchOptions.body = JSON.stringify(body); }
  const response = await fetch(url, fetchOptions);
  if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Request failed'); }
  return response.json();
}

export const projectsApi = {
  list: (params?: { status?: string; priority?: string; search?: string }) =>
    fetchApi<{ data: import('@/lib/types').Project[] }>('/projects', { searchParams: params as Record<string, string> }),
  get: (id: string) => fetchApi<{ data: import('@/lib/types').Project }>(`/projects/${id}`),
  create: (data: Partial<import('@/lib/types').Project>) => fetchApi('/projects', { method: 'POST', body: data }),
  update: (id: string, data: Partial<import('@/lib/types').Project>) => fetchApi(`/projects/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
};

export const tasksApi = {
  list: (params?: { projectId?: string; status?: string; priority?: string }) =>
    fetchApi<{ data: import('@/lib/types').Task[] }>('/tasks', { searchParams: params as Record<string, string> }),
  get: (id: string) => fetchApi<{ data: import('@/lib/types').Task }>(`/tasks/${id}`),
  create: (data: Partial<import('@/lib/types').Task>) => fetchApi('/tasks', { method: 'POST', body: data }),
  update: (id: string, data: Partial<import('@/lib/types').Task>) => fetchApi(`/tasks/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
};

export const milestonesApi = {
  list: (params?: { projectId?: string; status?: string }) =>
    fetchApi<{ data: import('@/lib/types').Milestone[] }>('/milestones', { searchParams: params as Record<string, string> }),
  create: (data: Partial<import('@/lib/types').Milestone>) => fetchApi('/milestones', { method: 'POST', body: data }),
};

export const deliverablesApi = {
  list: (params?: { projectId?: string }) =>
    fetchApi<{ data: import('@/lib/types').Deliverable[] }>('/deliverables', { searchParams: params as Record<string, string> }),
  create: (data: Partial<import('@/lib/types').Deliverable>) => fetchApi('/deliverables', { method: 'POST', body: data }),
};

export const teamMembersApi = {
  list: (params?: { projectId?: string }) =>
    fetchApi<{ data: import('@/lib/types').TeamMember[] }>('/team-members', { searchParams: params as Record<string, string> }),
  create: (data: Partial<import('@/lib/types').TeamMember>) => fetchApi('/team-members', { method: 'POST', body: data }),
};

export const activitiesApi = {
  list: (params?: { projectId?: string; type?: string; limit?: string }) =>
    fetchApi<{ data: import('@/lib/types').ProjectActivity[] }>('/activities', { searchParams: params as Record<string, string> }),
};

export const aiApi = {
  getProjectAdvice: (data: { name: string; description: string; priority: string }) =>
    fetchApi<{ advice: string }>('/ai/project-advice', { method: 'POST', body: data }),
  getTaskAdvice: (data: { title: string; description: string; projectContext: string }) =>
    fetchApi<{ advice: string }>('/ai/task-advice', { method: 'POST', body: data }),
  getProgressAdvice: (data: { name: string; progress: number; tasks: { total: number; done: number; inProgress: number }; daysRemaining: number }) =>
    fetchApi<{ advice: string }>('/ai/progress-advice', { method: 'POST', body: data }),
};
