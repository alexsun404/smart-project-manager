'use client';
import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIAdvisorProps { type: 'project_advice' | 'task_advice' | 'progress_advice'; data: Record<string, unknown>; onAdviceReceived?: (advice: string) => void; }

export default function AIAdvisor({ type, data, onAdviceReceived }: AIAdvisorProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    setLoading(true); setError(null); setAdvice(null);
    try {
      const response = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, ...data }) });
      if (!response.ok) throw new Error('获取建议失败');
      const result = await response.json();
      setAdvice(result.advice);
      onAdviceReceived?.(result.advice);
    } catch (err) { setError(err instanceof Error ? err.message : '获取建议失败'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <button onClick={handleGetAdvice} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'AI分析中...' : '获取AI建议'}
      </button>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {advice && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-purple-500" /><span className="font-medium text-purple-700">AI智能建议</span></div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{advice}</div>
        </div>
      )}
    </div>
  );
}
