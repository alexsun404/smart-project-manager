export const PROJECT_TAGS = [
  { id: 'game', name: '游戏专区', color: 'bg-purple-100 text-purple-700', description: '游戏相关运营项目' },
  { id: 'ai', name: 'AI应用', color: 'bg-blue-100 text-blue-700', description: 'AI技术应用项目' },
  { id: 'data', name: '数据分析', color: 'bg-green-100 text-green-700', description: '数据分析与报表项目' },
  { id: 'new-game', name: '新游新道具', color: 'bg-orange-100 text-orange-700', description: '新游戏/新道具上线项目' },
  { id: 'complaint', name: '客诉舆情', color: 'bg-red-100 text-red-700', description: '客诉处理与舆情监控' },
  { id: 'activity', name: '活动配置', color: 'bg-pink-100 text-pink-700', description: '活动策划与配置项目' },
] as const;

export type ProjectTagId = typeof PROJECT_TAGS[number]['id'];

export function getTagInfo(tagId: string) { return PROJECT_TAGS.find(tag => tag.id === tagId); }
export function getTagName(tagId: string) { const tag = getTagInfo(tagId); return tag?.name || tagId; }
export function getTagColor(tagId: string) { const tag = getTagInfo(tagId); return tag?.color || 'bg-gray-100 text-gray-700'; }
