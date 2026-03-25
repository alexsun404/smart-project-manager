import { promises as fs } from 'fs';
import path from 'path';
import { Project, Task, Milestone, Deliverable, TeamMember, TaskComment, ProjectActivity } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); }
  catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try { return JSON.parse(await fs.readFile(filePath, 'utf-8')); }
  catch { return defaultValue; }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

export const projectStorage = {
  async getAll(): Promise<Project[]> { return readJsonFile<Project[]>('projects.json', []); },
  async getById(id: string): Promise<Project | null> { const projects = await this.getAll(); return projects.find(p => p.id === id) || null; },
  async create(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const projects = await this.getAll();
    const newProject: Project = { ...data, id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString(), updated_at: null };
    projects.push(newProject); await writeJsonFile('projects.json', projects); return newProject;
  },
  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    const projects = await this.getAll(); const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...data, updated_at: new Date().toISOString() };
    await writeJsonFile('projects.json', projects); return projects[index];
  },
  async delete(id: string): Promise<boolean> {
    const projects = await this.getAll(); const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === projects.length) return false;
    await writeJsonFile('projects.json', filtered); return true;
  },
};

export const taskStorage = {
  async getAll(): Promise<Task[]> { return readJsonFile<Task[]>('tasks.json', []); },
  async getByProject(projectId: string): Promise<Task[]> { return (await this.getAll()).filter(t => t.project_id === projectId); },
  async getById(id: string): Promise<Task | null> { return (await this.getAll()).find(t => t.id === id) || null; },
  async create(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const tasks = await this.getAll();
    const newTask: Task = { ...data, id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString(), updated_at: null };
    tasks.push(newTask); await writeJsonFile('tasks.json', tasks); return newTask;
  },
  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    const tasks = await this.getAll(); const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...data, updated_at: new Date().toISOString() };
    await writeJsonFile('tasks.json', tasks); return tasks[index];
  },
  async delete(id: string): Promise<boolean> {
    const tasks = await this.getAll(); const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === tasks.length) return false;
    await writeJsonFile('tasks.json', filtered); return true;
  },
};

export const milestoneStorage = {
  async getAll(): Promise<Milestone[]> { return readJsonFile<Milestone[]>('milestones.json', []); },
  async getByProject(projectId: string): Promise<Milestone[]> { return (await this.getAll()).filter(m => m.project_id === projectId); },
  async create(data: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>): Promise<Milestone> {
    const milestones = await this.getAll();
    const newMilestone: Milestone = { ...data, id: `mile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString(), updated_at: null };
    milestones.push(newMilestone); await writeJsonFile('milestones.json', milestones); return newMilestone;
  },
};

export const deliverableStorage = {
  async getAll(): Promise<Deliverable[]> { return readJsonFile<Deliverable[]>('deliverables.json', []); },
  async getByProject(projectId: string): Promise<Deliverable[]> { return (await this.getAll()).filter(d => d.project_id === projectId); },
  async create(data: Omit<Deliverable, 'id' | 'created_at' | 'updated_at'>): Promise<Deliverable> {
    const deliverables = await this.getAll();
    const newDeliverable: Deliverable = { ...data, id: `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString(), updated_at: null };
    deliverables.push(newDeliverable); await writeJsonFile('deliverables.json', deliverables); return newDeliverable;
  },
};

export const teamMemberStorage = {
  async getAll(): Promise<TeamMember[]> { return readJsonFile<TeamMember[]>('team_members.json', []); },
  async getByProject(projectId: string): Promise<TeamMember[]> { return (await this.getAll()).filter(m => m.project_id === projectId); },
  async getById(id: string): Promise<TeamMember | null> { return (await this.getAll()).find(m => m.id === id) || null; },
  async create(data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember> {
    const members = await this.getAll();
    const newMember: TeamMember = { ...data, id: `tm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString(), updated_at: null };
    members.push(newMember); await writeJsonFile('team_members.json', members); return newMember;
  },
  async update(id: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
    const members = await this.getAll(); const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;
    members[index] = { ...members[index], ...data, updated_at: new Date().toISOString() };
    await writeJsonFile('team_members.json', members); return members[index];
  },
  async delete(id: string): Promise<boolean> {
    const members = await this.getAll(); const filtered = members.filter(m => m.id !== id);
    if (filtered.length === members.length) return false;
    await writeJsonFile('team_members.json', filtered); return true;
  },
};

export const commentStorage = {
  async getByTask(taskId: string): Promise<TaskComment[]> { return (await readJsonFile<TaskComment[]>('comments.json', [])).filter(c => c.task_id === taskId); },
  async create(data: Omit<TaskComment, 'id' | 'created_at' | 'updated_at'>): Promise<TaskComment> {
    const comments = await readJsonFile<TaskComment[]>('comments.json', []);
    const newComment: TaskComment = { ...data, id: `com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString(), updated_at: null };
    comments.push(newComment); await writeJsonFile('comments.json', comments); return newComment;
  },
};

export const activityStorage = {
  async getByProject(projectId: string): Promise<ProjectActivity[]> {
    return (await readJsonFile<ProjectActivity[]>('activities.json', [])).filter(a => a.project_id === projectId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  async create(data: Omit<ProjectActivity, 'id' | 'created_at'>): Promise<ProjectActivity> {
    const activities = await readJsonFile<ProjectActivity[]>('activities.json', []);
    const newActivity: ProjectActivity = { ...data, id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString() };
    activities.push(newActivity); await writeJsonFile('activities.json', activities); return newActivity;
  },
};
