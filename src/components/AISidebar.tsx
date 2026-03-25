'use client';
import { useState } from 'react';
import { Sparkles, Loader2, Send, X } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function AISidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const response = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'chat', messages: messages.concat([{ role: 'user', content: userMessage }]) }) });
      if (response.ok) { const result = await response.json(); setMessages(prev => [...prev, { role: 'assistant', content: result.advice || result.response }]); }
      else { setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，AI暂时无法回复，请稍后再试。' }]); }
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，服务暂时不可用。' }]); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50">
        <Sparkles className="w-6 h-6 text-white" />
      </button>
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /><span className="font-semibold text-gray-800">AI 智能助手</span></div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8"><Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>你好！我是AI智能助手</p><p className="text-sm mt-1">可以帮你分析项目、生成周报等</p></div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start"><div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-gray-500" /><span className="text-gray-500">思考中...</span></div></div>
            )}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="输入你的问题..." className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <button onClick={handleSend} disabled={loading || !input.trim()} className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 disabled:opacity-50"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />}
    </>
  );
}
