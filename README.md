# Smart Project Manager - 智能项目管理平台

一个基于 Next.js 14 + shadcn/ui 构建的智能项目管理平台，支持 AI 智能建议功能。

## 功能特性

- 项目管理（创建、编辑、删除、进度追踪）
- 任务管理
- 团队协作
- 成果归档
- AI 智能助手（项目建议、进度评估、周报生成）
- 响应式设计，支持移动端访问

## AI 功能

集成网易 AI Gateway (Qwen 3.5 Plus) 提供以下智能服务：

- **项目建议**：分析项目描述，提供任务拆分和时间规划建议
- **进度评估**：评估项目进展，提供风险预警和改进建议
- **任务建议**：为具体任务提供执行步骤和注意事项
- **周报摘要**：自动生成工作周报摘要

## 快速开始

```bash
npm install
npm run dev
```

访问 http://localhost:3000 查看应用。

## 技术栈

- Next.js 14 (App Router)
- shadcn/ui (基于 Radix UI)
- Tailwind CSS
- 网易 AI Gateway

## License

MIT
