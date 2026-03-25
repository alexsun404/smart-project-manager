'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projectsApi } from '@/lib/api-client';
import type { Project } from '@/lib/types';
import { ArrowLeft, CheckCircle2, Calendar } from 'lucide-react';

export default function CompletedPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadProjects(); }, []);
  const loadProjects = async () => { try { setLoading(true); const response = await projectsApi.list({ status: 'completed' }); setProjects(response.data || []); } catch (error) { console.error(error); } finally { setLoading(false); } };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF9] via-[#FEFCF9] to-[#F5F5F0]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8E8E3] sticky top-0 z-30"><div className="max-w-7xl mx-auto px-6 py-4"><div className="flex items-center gap-4"><Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-[#7F8C8D] hover:text-[#2C3E50]"><ArrowLeft className="w-4 h-4" />返回</Button></Link><h1 className="text-xl font-bold text-[#2C3E50]">已完成项目</h1></div></div></header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? <div className="text-center py-20 text-[#7F8C8D]">加载中...</div> :
         projects.length === 0 ? <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm"><CardContent className="py-20 text-center"><CheckCircle2 className="w-12 h-12 text-[#E8E8E3] mx-auto mb-4" /><p className="text-[#7F8C8D]">暂无已完成项目</p><Link href="/" className="mt-4 inline-block"><Button className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white mt-4">返回首页</Button></Link></CardContent></Card> :
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {projects.map(p => <Link key={p.id} href={`/projects/${p.id}`}><Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all h-full"><CardHeader><CardTitle className="text-lg text-[#2C3E50]">{p.name}</CardTitle></CardHeader><CardContent>{p.description && <p className="text-sm text-[#7F8C8D] mb-4 line-clamp-2">{p.description}</p>}<div className="flex items-center justify-between text-xs text-[#7F8C8D]"><div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>已完成</span></div>{p.end_date && <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /><span>{new Date(p.end_date).toLocaleDateString('zh-CN')}</span></div>}</div></CardContent></Card></Link>)}
         </div>}
      </main>
    </div>
  );
}
