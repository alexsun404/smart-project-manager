'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { projectsApi } from '@/lib/api-client';
import { PROJECT_TAGS, getTagColor, getTagName } from '@/lib/constants';
import type { Project } from '@/lib/types';
import AIAdvisor from '@/components/AIAdvisor';
import AISidebar from '@/components/AISidebar';
import { Plus, Search, Calendar, Users, Target, TrendingUp, Clock, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';

const statusMap: Record<string, { label: string; color: string }> = { planning: { label: '规划中', color: 'bg-blue-100 text-blue-700' }, active: { label: '进行中', color: 'bg-green-100 text-green-700' }, completed: { label: '已完成', color: 'bg-gray-100 text-gray-700' } };
const priorityMap: Record<string, { label: string; color: string }> = { low: { label: '低', color: 'bg-gray-100 text-gray-600' }, medium: { label: '中', color: 'bg-yellow-100 text-yellow-700' }, high: { label: '高', color: 'bg-orange-100 text-orange-700' }, urgent: { label: '紧急', color: 'bg-red-100 text-red-700' } };

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [aiAdviceDialog, setAiAdviceDialog] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', priority: 'medium' as Project['priority'], startDate: '', endDate: '', tags: [] as string[] });

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (searchTerm) params.search = searchTerm;
      const response = await projectsApi.list(params);
      setProjects(response.data || []);
    } catch (error) { console.error('Failed to load projects:', error); }
    finally { setLoading(false); }
  };

  const handleUpdateProgress = async (projectId: string, progress: number) => {
    try {
      let newStatus: 'planning' | 'active' | 'completed' | undefined;
      if (progress === 100) newStatus = 'completed';
      else if (progress > 0) newStatus = 'active';
      await projectsApi.update(projectId, { progress, ...(newStatus && { status: newStatus }) });
      setProjects(projects.map(p => p.id === projectId ? { ...p, progress, ...(newStatus && { status: newStatus }) } : p));
      setEditingProgress(null);
    } catch (error) { console.error('Failed to update progress:', error); }
  };

  const handleCreateProject = async () => {
    try {
      await projectsApi.create({ name: newProject.name, description: newProject.description, priority: newProject.priority, start_date: newProject.startDate || null, end_date: newProject.endDate || null, tags: newProject.tags });
      setCreateDialogOpen(false);
      setNewProject({ name: '', description: '', priority: 'medium', startDate: '', endDate: '', tags: [] });
      loadProjects();
    } catch (error) { console.error('Failed to create project:', error); }
  };

  const filteredProjects = projects.filter(project => {
    if (project.status === 'completed') return false;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || (project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    const matchesTag = tagFilter === 'all' || (project.tags && project.tags.includes(tagFilter));
    return matchesSearch && matchesStatus && matchesPriority && matchesTag;
  });

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    if (a.end_date && b.end_date) return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
    if (a.end_date) return -1;
    if (b.end_date) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8E8E3] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF764D] to-[#FF8F6B] rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2C3E50]">智能项目管理平台</h1>
                <p className="text-xs text-[#7F8C8D]">AI赋能 · 高效协作</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setAiAdviceDialog(true)} variant="outline" className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"><Sparkles className="w-4 h-4" /> AI助手</Button>
              <div className="flex items-center gap-2 text-sm text-[#7F8C8D]"><Clock className="w-4 h-4" /><span>{new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#7F8C8D]">全部项目</p><p className="text-2xl font-bold text-[#2C3E50] mt-1">{projects.length}</p></div><div className="w-12 h-12 bg-[#FF764D]/10 rounded-xl flex items-center justify-center"><Target className="w-6 h-6 text-[#FF764D]" /></div></div></CardContent></Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#7F8C8D]">进行中</p><p className="text-2xl font-bold text-[#2C3E50] mt-1">{projects.filter(p => p.status === 'active').length}</p></div><div className="w-12 h-12 bg-[#4ECDC4]/10 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#4ECDC4]" /></div></div></CardContent></Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#7F8C8D]">已完成</p><p className="text-2xl font-bold text-[#2C3E50] mt-1">{projects.filter(p => p.status === 'completed').length}</p></div><div className="w-12 h-12 bg-[#9B59B6]/10 rounded-xl flex items-center justify-center"><Target className="w-6 h-6 text-[#9B59B6]" /></div></div></CardContent></Card>
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#7F8C8D]">平均进度</p><p className="text-2xl font-bold text-[#2C3E50] mt-1">{projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%</p></div><div className="w-12 h-12 bg-[#F39C12]/10 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#F39C12]" /></div></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/tags"><Card className="bg-gradient-to-br from-[#9B59B6]/5 to-[#9B59B6]/10 border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"><CardContent className="pt-6"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-[#9B59B6]/20 rounded-xl flex items-center justify-center"><Target className="w-6 h-6 text-[#9B59B6]" /></div><div><h3 className="text-[#2C3E50] font-semibold">项目分类</h3><p className="text-sm text-[#7F8C8D]">按标签类型查看</p></div></div><ChevronRight className="w-5 h-5 text-[#9B59B6]" /></div></CardContent></Card></Link>
          <Link href="/schedule"><Card className="bg-gradient-to-br from-[#FF764D]/5 to-[#FF764D]/10 border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"><CardContent className="pt-6"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-[#FF764D]/20 rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6 text-[#FF764D]" /></div><div><h3 className="text-[#2C3E50] font-semibold">事项安排</h3><p className="text-sm text-[#7F8C8D]">按周/月维度管理</p></div></div><ChevronRight className="w-5 h-5 text-[#FF764D]" /></div></CardContent></Card></Link>
          <Link href="/completed"><Card className="bg-gradient-to-br from-[#4ECDC4]/5 to-[#4ECDC4]/10 border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"><CardContent className="pt-6"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-[#4ECDC4]/20 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-[#4ECDC4]" /></div><div><h3 className="text-[#2C3E50] font-semibold">已完成项目</h3><p className="text-sm text-[#7F8C8D]">按周/月归类查看</p></div></div><ChevronRight className="w-5 h-5 text-[#4ECDC4]" /></div></CardContent></Card></Link>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#7F8C8D]" /><Input placeholder="搜索项目..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white border-[#E8E8E3] focus:border-[#FF764D] focus:ring-[#FF764D]" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full md:w-32 bg-white border-[#E8E8E3]"><SelectValue placeholder="状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="planning">规划中</SelectItem><SelectItem value="active">进行中</SelectItem><SelectItem value="completed">已完成</SelectItem></SelectContent></Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-full md:w-32 bg-white border-[#E8E8E3]"><SelectValue placeholder="优先级" /></SelectTrigger><SelectContent><SelectItem value="all">全部优先级</SelectItem><SelectItem value="urgent">紧急</SelectItem><SelectItem value="high">高</SelectItem><SelectItem value="medium">中</SelectItem><SelectItem value="low">低</SelectItem></SelectContent></Select>
            <Select value={tagFilter} onValueChange={setTagFilter}><SelectTrigger className="w-full md:w-36 bg-white border-[#E8E8E3]"><SelectValue placeholder="标签" /></SelectTrigger><SelectContent><SelectItem value="all">全部标签</SelectItem>{PROJECT_TAGS.map((tag) => (<SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>))}</SelectContent></Select>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}><DialogTrigger asChild><Button className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white gap-2"><Plus className="w-4 h-4" />新建项目</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="text-[#2C3E50]">新建项目</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><div><Label className="text-[#2C3E50]">项目名称 *</Label><Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="输入项目名称" className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" /></div><div><Label className="text-[#2C3E50]">项目描述</Label><Textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="简要描述项目目标和范围" className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" rows={3} /></div><div><Label className="text-[#2C3E50]">优先级</Label><Select value={newProject.priority} onValueChange={(value) => setNewProject({ ...newProject, priority: value as Project['priority'] })}><SelectTrigger className="mt-1.5 border-[#E8E8E3]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="urgent">紧急</SelectItem><SelectItem value="high">高</SelectItem><SelectItem value="medium">中</SelectItem><SelectItem value="low">低</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-3"><div><Label className="text-[#2C3E50]">开始日期</Label><Input type="date" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" /></div><div><Label className="text-[#2C3E50]">结束日期</Label><Input type="date" value={newProject.endDate} onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })} className="mt-1.5 border-[#E8E8E3] focus:border-[#FF764D]" /></div></div><div><Label className="text-[#2C3E50]">项目标签</Label><div className="flex flex-wrap gap-2 mt-2">{PROJECT_TAGS.map((tag) => (<Badge key={tag.id} className={`cursor-pointer transition-all ${newProject.tags.includes(tag.id) ? tag.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} border-0`} onClick={() => { const tags = newProject.tags.includes(tag.id) ? newProject.tags.filter(t => t !== tag.id) : [...newProject.tags, tag.id]; setNewProject({ ...newProject, tags }); }}>{tag.name}</Badge>))}</div></div><div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-[#E8E8E3]">取消</Button><Button onClick={handleCreateProject} disabled={!newProject.name} className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">创建项目</Button></div></div></DialogContent></Dialog>
        </div>

        {loading ? <div className="flex items-center justify-center py-20"><div className="text-[#7F8C8D]">加载中...</div></div> : sortedProjects.length === 0 ? <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm"><CardContent className="py-20 text-center"><Target className="w-12 h-12 text-[#E8E8E3] mx-auto mb-4" /><p className="text-[#7F8C8D] mb-4">暂无项目</p><Button onClick={() => setCreateDialogOpen(true)} className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">创建第一个项目</Button></CardContent></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{sortedProjects.map((project) => (<Card key={project.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group h-full flex flex-col"><CardHeader className="pb-3 flex-shrink-0"><Link href={`/projects/${project.id}`} className="block"><div className="flex items-start justify-between"><div className="flex-1 min-w-0"><CardTitle className="text-lg font-semibold text-[#2C3E50] group-hover:text-[#FF764D] transition-colors line-clamp-1">{project.name}</CardTitle><div className="flex items-center gap-2 mt-2"><Badge className={`${statusMap[project.status].color} border-0 text-xs`}>{statusMap[project.status].label}</Badge><Badge className={`${priorityMap[project.priority].color} border-0 text-xs`}>{priorityMap[project.priority].label}</Badge></div></div><ChevronRight className="w-5 h-5 text-[#E8E8E3] group-hover:text-[#FF764D] transition-colors flex-shrink-0" /></div></Link></CardHeader><CardContent className="flex-1 flex flex-col"><div className="h-10 mb-3 flex-shrink-0">{project.description ? <p className="text-sm text-[#7F8C8D] line-clamp-2">{project.description}</p> : <p className="text-sm text-[#BFBFBF]">暂无描述</p>}</div><div className="mt-auto space-y-3"><div onClick={(e) => { e.stopPropagation(); setEditingProgress(project.id); }}><div className="flex items-center justify-between text-xs text-[#7F8C8D] mb-1.5"><span>项目进度</span>{editingProgress === project.id ? <Input type="number" min="0" max="100" defaultValue={project.progress} className="w-14 h-5 text-xs text-right border-[#FF764D] px-1 py-0" autoFocus onClick={(e) => e.stopPropagation()} onBlur={(e) => { const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0)); handleUpdateProgress(project.id, value); }} onKeyDown={(e) => { if (e.key === 'Enter') { const target = e.target as HTMLInputElement; const value = Math.min(100, Math.max(0, parseInt(target.value) || 0)); handleUpdateProgress(project.id, value); } if (e.key === 'Escape') setEditingProgress(null); }} /> : <span className="font-medium text-[#2C3E50] hover:text-[#FF764D]">{project.progress}%</span>}</div><Progress value={project.progress} className="h-2 bg-[#F5F5F0]" /></div><div className="flex items-center justify-between text-xs text-[#7F8C8D] h-5"><div className="flex items-center gap-1 min-w-0"><Calendar className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{project.start_date ? <>{new Date(project.start_date).toLocaleDateString('zh-CN', { month: 'short' as const, day: 'numeric' as const })}{project.end_date && ` - ${new Date(project.end_date).toLocaleDateString('zh-CN', { month: 'short' as const, day: 'numeric' as const })}`}</> : '未设置日期'}</span></div><div className="flex items-center gap-1 flex-shrink-0"><Users className="w-3.5 h-3.5" /><span>团队协作</span></div></div><div className="h-6 flex flex-wrap gap-1.5 items-center">{project.tags && project.tags.length > 0 ? <>{project.tags.slice(0, 3).map((tagId: string, index: number) => (<Badge key={index} className={`${getTagColor(tagId)} border-0 text-xs`}>{getTagName(tagId)}</Badge>))}{project.tags.length > 3 && <Badge variant="outline" className="text-xs border-[#E8E8E3] text-[#7F8C8D]">+{project.tags.length - 3}</Badge>}</> : <span className="text-xs text-[#BFBFBF]">暂无标签</span>}</div></div></CardContent></Card>))}</div>}
      </main>

      <Dialog open={aiAdviceDialog} onOpenChange={setAiAdviceDialog}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="flex items-center gap-2 text-[#2C3E50]"><Sparkles className="w-5 h-5 text-purple-500" />AI 智能助手</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><p className="text-sm text-[#7F8C8D]">选择一个功能，获取AI智能建议：</p><div className="space-y-3"><AIAdvisor type="project_advice" data={{ name: newProject.name || '示例项目', description: newProject.description || '项目描述', priority: newProject.priority }} /></div></div></DialogContent></Dialog>
      <AISidebar />
    </div>
  );
}