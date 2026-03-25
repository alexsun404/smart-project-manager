'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectsApi, tasksApi, deliverablesApi, teamMembersApi, activitiesApi } from '@/lib/api-client';
import { PROJECT_TAGS, getTagColor, getTagName } from '@/lib/constants';
import type { Project, Task, Deliverable, TeamMember } from '@/lib/types';
import AIAdvisor from '@/components/AIAdvisor';
import AISidebar from '@/components/AISidebar';
import { ArrowLeft, Calendar, Users, TrendingUp, Edit2, Trash2, Plus, CheckCircle2, FileText, Activity, Sparkles } from 'lucide-react';

const statusMap: Record<string, { label: string; color: string }> = { planning: { label: '规划中', color: 'bg-blue-100 text-blue-700' }, active: { label: '进行中', color: 'bg-green-100 text-green-700' }, completed: { label: '已完成', color: 'bg-gray-100 text-gray-700' } };
const taskStatusMap: Record<string, { label: string; color: string }> = { todo: { label: '待办', color: 'bg-gray-100 text-gray-700' }, in_progress: { label: '进行中', color: 'bg-blue-100 text-blue-700' }, done: { label: '已完成', color: 'bg-green-100 text-green-700' } };
const priorityMap: Record<string, { label: string; color: string }> = { low: { label: '低', color: 'bg-gray-100 text-gray-600' }, medium: { label: '中', color: 'bg-yellow-100 text-yellow-700' }, high: { label: '高', color: 'bg-orange-100 text-orange-700' }, urgent: { label: '紧急', color: 'bg-red-100 text-red-700' } };

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', status: 'planning' as Project['status'], priority: 'medium' as Project['priority'], startDate: '', endDate: '', progress: 0, tags: [] as string[] });
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member' as 'owner' | 'admin' | 'member' | 'viewer', department: '', position: '' });
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' as Task['status'], priority: 'medium' as Task['priority'], start_date: '', due_date: '' });
  const [addDeliverableDialogOpen, setAddDeliverableDialogOpen] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState({ title: '', description: '' });
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  useEffect(() => { loadProjectData(); }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes, deliverablesRes, teamRes, activitiesRes] = await Promise.all([projectsApi.get(projectId), tasksApi.list({ projectId }), deliverablesApi.list({ projectId }), teamMembersApi.list({ projectId }), activitiesApi.list({ projectId })]);
      setProject(projectRes.data); setTasks(tasksRes.data || []); setDeliverables(deliverablesRes.data || []); setTeamMembers(teamRes.data || []); setActivities(activitiesRes.data || []);
      if (projectRes.data) setEditForm({ name: projectRes.data.name, description: projectRes.data.description || '', status: projectRes.data.status, priority: projectRes.data.priority, startDate: projectRes.data.start_date ? projectRes.data.start_date.split('T')[0] : '', endDate: projectRes.data.end_date ? projectRes.data.end_date.split('T')[0] : '', progress: projectRes.data.progress, tags: projectRes.data.tags || [] });
    } catch (error) { console.error('Failed to load project:', error); }
    finally { setLoading(false); }
  };

  const handleUpdateProject = async () => {
    try {
      let autoStatus = editForm.status;
      if (editForm.progress === 100) autoStatus = 'completed';
      else if (editForm.progress > 0) autoStatus = 'active';
      await projectsApi.update(projectId, { name: editForm.name, description: editForm.description, status: autoStatus, priority: editForm.priority, start_date: editForm.startDate || null, end_date: editForm.endDate || null, progress: editForm.progress, tags: editForm.tags });
      setEditDialogOpen(false); loadProjectData();
    } catch (error) { console.error('Failed to update project:', error); }
  };

  const handleAddMember = async () => {
    try { await teamMembersApi.create({ user_id: `user-${Date.now()}`, project_id: projectId, name: newMember.name, email: newMember.email, role: newMember.role, department: newMember.department, position: newMember.position }); setAddMemberDialogOpen(false); setNewMember({ name: '', email: '', role: 'member', department: '', position: '' }); loadProjectData(); } catch (error) { console.error('Failed to add member:', error); }
  };

  const handleDeleteProject = async () => { if (!confirm('确定要删除此项目吗？此操作不可撤销。')) return; try { await projectsApi.delete(projectId); router.push('/'); } catch (error) { console.error('Failed to delete project:', error); } };

  const handleAddTask = async () => {
    try { await tasksApi.create({ project_id: projectId, title: newTask.title, description: newTask.description, status: newTask.status, priority: newTask.priority, start_date: newTask.start_date || null, due_date: newTask.due_date || null }); setAddTaskDialogOpen(false); setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', start_date: '', due_date: '' }); loadProjectData(); } catch (error) { console.error('Failed to create task:', error); }
  };

  const handleAddDeliverable = async () => {
    if (!newDeliverable.title) return;
    try { await deliverablesApi.create({ project_id: projectId, title: newDeliverable.title, description: newDeliverable.description, type: '其他文件' }); setAddDeliverableDialogOpen(false); setNewDeliverable({ title: '', description: '' }); loadProjectData(); } catch (error) { console.error('Failed to create deliverable:', error); }
  };

  if (loading) return <div className="min-h-screen bg-[#FEFCF9] flex items-center justify-center"><div className="text-[#7F8C8D]">加载中...</div></div>;
  if (!project) return <div className="min-h-screen bg-[#FEFCF9] flex items-center justify-center"><div className="text-center"><p className="text-[#7F8C8D]">项目不存在</p></div></div>;

  const taskStats = { total: tasks.length, done: tasks.filter(t => t.status === 'done').length, inProgress: tasks.filter(t => t.status === 'in_progress').length };
  const daysRemaining = project.end_date ? Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF9] via-[#FEFCF9] to-[#F5F5F0]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8E8E3] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-[#7F8C8D] hover:text-[#2C3E50]"><ArrowLeft className="w-4 h-4" />返回</Button></Link>
              <div className="h-6 w-px bg-[#E8E8E3]" />
              <div><div className="flex items-center gap-3"><h1 className="text-xl font-bold text-[#2C3E50]">{project.name}</h1><Badge className={`${statusMap[project.status].color} border-0`}>{statusMap[project.status].label}</Badge></div><p className="text-sm text-[#7F8C8D] mt-0.5">创建于 {new Date(project.created_at).toLocaleDateString('zh-CN')}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setAiDialogOpen(true)} variant="outline" size="sm" className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"><Sparkles className="w-4 h-4" />AI建议</Button>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}><DialogTrigger asChild><Button variant="outline" size="sm" className="gap-2 border-[#E8E8E3]"><Edit2 className="w-4 h-4" />编辑</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="text-[#2C3E50]">编辑项目</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><div><Label className="text-[#2C3E50]">项目名称</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" /></div><div><Label className="text-[#2C3E50]">项目描述</Label><Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" rows={3} /></div><div className="grid grid-cols-2 gap-3"><div><Label className="text-[#2C3E50]">状态</Label><Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value as Project['status'] })}><SelectTrigger className="mt-1.5 border-[#E8E8E3]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planning">规划中</SelectItem><SelectItem value="active">进行中</SelectItem><SelectItem value="completed">已完成</SelectItem></SelectContent></Select></div><div><Label className="text-[#2C3E50]">优先级</Label><Select value={editForm.priority} onValueChange={(value) => setEditForm({ ...editForm, priority: value as Project['priority'] })}><SelectTrigger className="mt-1.5 border-[#E8E8E3]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="urgent">紧急</SelectItem><SelectItem value="high">高</SelectItem><SelectItem value="medium">中</SelectItem><SelectItem value="low">低</SelectItem></SelectContent></Select></div></div><div><Label className="text-[#2C3E50]">项目进度: {editForm.progress}%</Label><Input type="range" min="0" max="100" value={editForm.progress} onChange={(e) => setEditForm({ ...editForm, progress: parseInt(e.target.value) })} className="mt-1.5" /></div><div><Label className="text-[#2C3E50]">项目标签</Label><div className="flex flex-wrap gap-2 mt-2">{PROJECT_TAGS.map((tag) => (<Badge key={tag.id} className={`cursor-pointer transition-all ${editForm.tags.includes(tag.id) ? tag.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} border-0`} onClick={() => { const tags = editForm.tags.includes(tag.id) ? editForm.tags.filter(t => t !== tag.id) : [...editForm.tags, tag.id]; setEditForm({ ...editForm, tags }); }}>{tag.name}</Badge>))}</div></div><div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setEditDialogOpen(false)} className="border-[#E8E8E3]">取消</Button><Button onClick={handleUpdateProject} className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">保存修改</Button></div></div></DialogContent></Dialog>
              <Button variant="outline" size="sm" onClick={handleDeleteProject} className="gap-2 border-[#E8E8E3] text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" />删除</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" />AI 智能建议</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><AIAdvisor type="project_advice" data={{ name: project.name, description: project.description || '', priority: project.priority }} /><AIAdvisor type="progress_advice" data={{ name: project.name, progress: project.progress, tasks: { total: taskStats.total, done: taskStats.done, inProgress: taskStats.inProgress }, daysRemaining }} /></div></DialogContent></Dialog>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#7F8C8D]">项目进度</p><div className="flex items-baseline gap-2 mt-1"><span className="text-2xl font-bold text-[#2C3E50]">{editForm.progress}%</span></div></div><div className="w-12 h-12 bg-[#FF764D]/10 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#FF764D]" /></div></div><Progress value={editForm.progress} className="h-2 bg-[#F5F5F0] mt-3" /></CardContent></Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm cursor-pointer" onClick={() => setActiveTab('tasks')}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#7F8C8D]">任务总数</p><p className="text-2xl font-bold text-[#2C3E50] mt-1">{taskStats.total}</p></div><div className="w-12 h-12 bg-[#4ECDC4]/10 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-[#4ECDC4]" /></div></div><div className="flex items-center gap-2 mt-3 text-xs text-[#7F8C8D]"><span className="text-green-600">{taskStats.done} 完成</span><span>·</span><span className="text-blue-600">{taskStats.inProgress} 进行中</span></div></CardContent></Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm cursor-pointer" onClick={() => setActiveTab('deliverables')}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#7F8C8D]">成果归档</p><p className="text-2xl font-bold text-[#2C3E50] mt-1">{deliverables.length}</p></div><div className="w-12 h-12 bg-[#F39C12]/10 rounded-xl flex items-center justify-center"><FileText className="w-6 h-6 text-[#F39C12]" /></div></div></CardContent></Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm cursor-pointer" onClick={() => setActiveTab('team')}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#7F8C8D]">团队成员</p><p className="text-2xl font-bold text-[#2C3E50] mt-1">{teamMembers.length}</p></div><div className="w-12 h-12 bg-[#3498DB]/10 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-[#3498DB]" /></div></div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/60 backdrop-blur-sm border border-[#E8E8E3] p-1"><TabsTrigger value="overview">概览</TabsTrigger><TabsTrigger value="tasks">任务</TabsTrigger><TabsTrigger value="deliverables">成果归档</TabsTrigger><TabsTrigger value="team">团队</TabsTrigger><TabsTrigger value="activity">动态</TabsTrigger></TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm border-0 shadow-sm"><CardHeader><CardTitle className="text-[#2C3E50]">项目信息</CardTitle></CardHeader><CardContent className="space-y-4">{project.description && <div><p className="text-sm text-[#7F8C8D] mb-2">项目描述</p><p className="text-[#2C3E50]">{project.description}</p></div>}<div className="grid grid-cols-2 gap-4">{project.start_date && <div><p className="text-sm text-[#7F8C8D] mb-1">开始日期</p><div className="flex items-center gap-2 text-[#2C3E50]"><Calendar className="w-4 h-4 text-[#FF764D]" /><span>{new Date(project.start_date).toLocaleDateString('zh-CN')}</span></div></div>}{project.end_date && <div><p className="text-sm text-[#7F8C8D] mb-1">结束日期</p><div className="flex items-center gap-2 text-[#2C3E50]"><Calendar className="w-4 h-4 text-[#4ECDC4]" /><span>{new Date(project.end_date).toLocaleDateString('zh-CN')}</span></div></div>}</div>{project.tags && project.tags.length > 0 && <div><p className="text-sm text-[#7F8C8D] mb-2">标签</p><div className="flex flex-wrap gap-2">{project.tags.map((tagId: string, index: number) => (<Badge key={index} className={`${getTagColor(tagId)} border-0`}>{getTagName(tagId)}</Badge>))}</div></div>}</CardContent></Card>
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm"><CardHeader><CardTitle className="text-[#2C3E50]">最近动态</CardTitle></CardHeader><CardContent><div className="space-y-4">{activities.slice(0, 5).map((activity) => (<div key={activity.id} className="flex items-start gap-3"><div className="mt-0.5"><Activity className="w-4 h-4 text-[#4ECDC4]" /></div><div className="flex-1 min-w-0"><p className="text-sm text-[#2C3E50] font-medium line-clamp-1">{activity.title}</p><p className="text-xs text-[#7F8C8D] mt-0.5">{activity.user_name} · {new Date(activity.created_at).toLocaleDateString('zh-CN')}</p></div></div>))}{activities.length === 0 && <p className="text-sm text-[#7F8C8D] text-center py-4">暂无动态</p>}</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader><CardTitle className="text-[#2C3E50] flex items-center justify-between"><span>任务列表</span><Dialog open={addTaskDialogOpen} onOpenChange={setAddTaskDialogOpen}><DialogTrigger asChild><Button className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white gap-2"><Plus className="w-4 h-4" />新建任务</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="text-[#2C3E50]">新建任务</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><div><Label className="text-[#2C3E50]">任务名称 *</Label><Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="输入任务名称" className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" /></div><div><Label className="text-[#2C3E50]">任务描述</Label><Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="简要描述任务内容" className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" rows={3} /></div><div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setAddTaskDialogOpen(false)} className="border-[#E8E8E3]">取消</Button><Button onClick={handleAddTask} disabled={!newTask.title} className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">创建任务</Button></div></div></DialogContent></Dialog></CardTitle></CardHeader>
              <CardContent>{tasks.length === 0 ? <div className="text-center py-12"><CheckCircle2 className="w-12 h-12 text-[#E8E8E3] mx-auto mb-4" /><p className="text-[#7F8C8D] mb-4">暂无任务</p><Button onClick={() => setAddTaskDialogOpen(true)} className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">创建第一个任务</Button></div> : <div className="space-y-3">{tasks.map((task) => (<div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#E8E8E3] hover:shadow-sm transition-shadow"><div className="flex items-center gap-4"><div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}`} /><div><p className="text-[#2C3E50] font-medium">{task.title}</p>{task.description && <p className="text-sm text-[#7F8C8D] mt-0.5 line-clamp-1">{task.description}</p>}</div></div><div className="flex items-center gap-3"><Badge className={`${priorityMap[task.priority].color} border-0 text-xs`}>{priorityMap[task.priority].label}</Badge><Badge className={`${taskStatusMap[task.status].color} border-0 text-xs`}>{taskStatusMap[task.status].label}</Badge></div></div>)}</div>}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliverables" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader><CardTitle className="text-[#2C3E50] flex items-center justify-between"><span>成果归档</span><Dialog open={addDeliverableDialogOpen} onOpenChange={setAddDeliverableDialogOpen}><DialogTrigger asChild><Button className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white gap-2"><Plus className="w-4 h-4" />上传成果</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="text-[#2C3E50]">上传成果</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><div><Label className="text-[#2C3E50]">成果名称 *</Label><Input value={newDeliverable.title} onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })} placeholder="输入成果名称" className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" /></div><div><Label className="text-[#2C3E50]">成果描述</Label><Textarea value={newDeliverable.description} onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })} placeholder="简要描述成果内容" className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" rows={3} /></div><div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setAddDeliverableDialogOpen(false)} className="border-[#E8E8E3]">取消</Button><Button onClick={handleAddDeliverable} disabled={!newDeliverable.title} className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">上传成果</Button></div></div></DialogContent></Dialog></CardTitle></CardHeader>
              <CardContent>{deliverables.length === 0 ? <div className="text-center py-12"><FileText className="w-12 h-12 text-[#E8E8E3] mx-auto mb-4" /><p className="text-[#7F8C8D] mb-4">暂无成果</p><Button onClick={() => setAddDeliverableDialogOpen(true)} className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">上传第一个成果</Button></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{deliverables.map((del) => (<div key={del.id} className="p-4 bg-white rounded-lg border border-[#E8E8E3]"><div className="flex items-start gap-3 mb-3"><div className="w-10 h-10 bg-[#F39C12]/10 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-[#F39C12]" /></div><div className="flex-1 min-w-0"><p className="text-[#2C3E50] font-medium line-clamp-1">{del.title}</p><p className="text-xs text-[#7F8C8D] mt-0.5">{del.type}</p></div></div>{del.description && <p className="text-sm text-[#7F8C8D] line-clamp-2 mb-3">{del.description}</p>}<div className="flex items-center justify-between pt-3 border-t border-[#E8E8E3]"><span className="text-xs text-[#7F8C8D]">{new Date(del.created_at).toLocaleDateString('zh-CN')}</span></div></div>))}</div>}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader><CardTitle className="text-[#2C3E50] flex items-center justify-between"><span>团队成员</span><Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}><DialogTrigger asChild><Button className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white gap-2"><Plus className="w-4 h-4" />添加成员</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="text-[#2C3E50]">添加团队成员</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><div className="grid grid-cols-2 gap-3"><div><Label className="text-[#2C3E50]">姓名 *</Label><Input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} placeholder="成员姓名" className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" /></div><div><Label className="text-[#2C3E50]">邮箱 *</Label><Input type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} placeholder="email@example.com" className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" /></div></div><div><Label className="text-[#2C3E50]">角色</Label><Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value as 'owner' | 'admin' | 'member' | 'viewer' })}><SelectTrigger className="mt-1.5 border-[#E8E8E3]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="owner">所有者</SelectItem><SelectItem value="admin">管理员</SelectItem><SelectItem value="member">成员</SelectItem><SelectItem value="viewer">访客</SelectItem></SelectContent></Select></div><div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setAddMemberDialogOpen(false)} className="border-[#E8E8E3]">取消</Button><Button onClick={handleAddMember} disabled={!newMember.name || !newMember.email} className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">添加成员</Button></div></div></DialogContent></Dialog></CardTitle></CardHeader>
              <CardContent>{teamMembers.length === 0 ? <div className="text-center py-12"><Users className="w-12 h-12 text-[#E8E8E3] mx-auto mb-4" /><p className="text-[#7F8C8D] mb-4">暂无团队成员</p><Button onClick={() => setAddMemberDialogOpen(true)} className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">添加第一个成员</Button></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{teamMembers.map((member) => (<div key={member.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-[#E8E8E3]"><div className="w-12 h-12 bg-[#4ECDC4]/20 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[#4ECDC4] font-semibold text-lg">{member.name.charAt(0)}</span></div><div className="flex-1 min-w-0"><p className="text-[#2C3E50] font-medium">{member.name}</p><p className="text-xs text-[#7F8C8D]">{member.position || member.role}</p></div><Badge className={`${member.role === 'owner' ? 'bg-purple-100 text-purple-700' : member.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} border-0 text-xs`}>{member.role === 'owner' ? '所有者' : member.role === 'admin' ? '管理员' : '成员'}</Badge></div>))}</div>}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm"><CardHeader><CardTitle className="text-[#2C3E50]">项目动态</CardTitle></CardHeader><CardContent>{activities.length === 0 ? <div className="text-center py-12"><Activity className="w-12 h-12 text-[#E8E8E3] mx-auto mb-4" /><p className="text-[#7F8C8D]">暂无动态</p></div> : <div className="space-y-4">{activities.map((activity) => (<div key={activity.id} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-[#E8E8E3]"><div className="mt-1"><Activity className="w-4 h-4 text-[#4ECDC4]" /></div><div className="flex-1 min-w-0"><p className="text-[#2C3E50] font-medium">{activity.title}</p>{activity.description && <p className="text-sm text-[#7F8C8D] mt-1">{activity.description}</p>}<div className="flex items-center gap-2 mt-2 text-xs text-[#7F8C8D]">{activity.user_name && <span>{activity.user_name}</span>}<span>·</span><span>{new Date(activity.created_at).toLocaleString('zh-CN')}</span></div></div></div>)}</div>}</CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>
      <AISidebar />
    </div>
  );
}
