// AI Service - 163 AI Gateway Integration

interface AIRequest {
  model?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

interface AIResponse {
  choices: Array<{ message: { content: string }; finish_reason: string }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const baseUrl = process.env.AI_BASE_URL || 'https://aigw.ds.163.com/v1';
  const appKey = process.env.AI_APP_KEY || '';
  const model = process.env.AI_MODEL || 'Qwen 3.5 Plus';
  const messages: AIRequest['messages'] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  const requestBody: AIRequest = { model, messages, temperature: 0.7, max_tokens: 2000 };
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${appKey}` },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) throw new Error(`AI API Error: ${response.status}`);
    const data: AIResponse = await response.json();
    return data.choices?.[0]?.message?.content || '抱歉，AI暂时无法提供建议。';
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

export async function getProjectAdvice(projectName: string, description: string, priority: string): Promise<string> {
  const systemPrompt = '你是一位专业的项目管理顾问，擅长为运营团队提供项目管理建议。';
  const userPrompt = `请为以下运营项目提供建议：
项目名称：${projectName}
项目描述：${description || '暂无描述'}
优先级：${priority === 'urgent' ? '紧急' : priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}

请从项目拆分建议、时间规划建议、风险预警、资源配置建议等方面给出建议。`;
  return callAI(userPrompt, systemPrompt);
}

export async function getTaskAdvice(taskTitle: string, taskDescription: string, projectContext: string): Promise<string> {
  const systemPrompt = '你是一位专业的运营专家，擅长为运营人员提供任务执行建议。';
  const userPrompt = `项目背景：${projectContext}

任务信息：
任务名称：${taskTitle}
任务描述：${taskDescription || '暂无描述'}

请提供任务执行的关键步骤、注意事项、可能遇到的困难及应对方案。`;
  return callAI(userPrompt, systemPrompt);
}

export async function getProgressAdvice(projectData: { name: string; progress: number; tasks: { total: number; done: number; inProgress: number }; daysRemaining: number }): Promise<string> {
  const systemPrompt = '你是一位专业的项目进度管理专家，擅长评估项目进展并提供改进建议。';
  const userPrompt = `请评估以下项目进展：

项目名称：${projectData.name}
当前进度：${projectData.progress}%
任务完成情况：已完成 ${projectData.tasks.done}/${projectData.tasks.total}，进行中 ${projectData.tasks.inProgress}
剩余时间：约 ${projectData.daysRemaining} 天

请提供当前进度评估（正常/偏慢/危险）、赶进度的建议、风险提示。`;
  return callAI(userPrompt, systemPrompt);
}
