'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PROJECT_TAGS } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';

export default function TagsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF9] via-[#FEFCF9] to-[#F5F5F0]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8E8E3] sticky top-0 z-30"><div className="max-w-7xl mx-auto px-6 py-4"><div className="flex items-center gap-4"><Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-[#7F8C8D] hover:text-[#2C3E50]"><ArrowLeft className="w-4 h-4" />返回</Button></Link><h1 className="text-xl font-bold text-[#2C3E50]">项目分类</h1></div></div></header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROJECT_TAGS.map(tag => <Card key={tag.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all"><CardHeader><CardTitle className="flex items-center gap-2"><Badge className={`${tag.color} border-0`}>{tag.name}</Badge></CardTitle></CardHeader><CardContent><p className="text-sm text-[#7F8C8D]">{tag.description}</p></CardContent></Card>)}
        </div>
      </main>
    </div>
  );
}
