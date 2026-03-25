'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF9] via-[#FEFCF9] to-[#F5F5F0]">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8E8E3] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4"><div className="flex items-center gap-4"><Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-[#7F8C8D] hover:text-[#2C3E50]"><ArrowLeft className="w-4 h-4" />返回</Button></Link><h1 className="text-xl font-bold text-[#2C3E50]">事项安排</h1></div></div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8"><Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm"><CardContent className="py-20 text-center"><p className="text-[#7F8C8D] mb-4">事项安排功能开发中...</p><Link href="/"><Button className="bg-[#FF764D] hover:bg-[#FF6B3D] text-white">返回首页</Button></Link></CardContent></Card></main>
    </div>
  );
}
