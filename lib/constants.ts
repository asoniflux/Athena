export const APP_NAME = 'Athena AI'
export const APP_DESCRIPTION = 'Your AI-Powered Personal Command Center'

export const SIDEBAR_MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard', shortcut: '1' },
  { key: 'tasks', label: 'Tasks', icon: 'CheckSquare', href: '/tasks', shortcut: '2' },
  { key: 'calendar', label: 'Calendar', icon: 'Calendar', href: '/calendar', shortcut: '3' },
  { key: 'knowledge', label: 'Knowledge', icon: 'BookOpen', href: '/knowledge', shortcut: '4' },
  { key: 'files', label: 'Files', icon: 'FolderOpen', href: '/files', shortcut: '5' },
  { key: 'content', label: 'Content', icon: 'PenTool', href: '/content', shortcut: '6' },
  { key: 'ideas', label: 'Ideas', icon: 'Lightbulb', href: '/ideas', shortcut: '7' },
  { key: 'habits', label: 'Habits', icon: 'Target', href: '/habits', shortcut: '8' },
  { key: 'chat', label: 'AI Chat', icon: 'MessageSquare', href: '/chat', shortcut: '9' },
  { key: 'media', label: 'Media', icon: 'Video', href: '/media', shortcut: '0' },
] as const

export const PRIORITY_CONFIG = {
  P1: { label: 'Urgent', color: 'text-danger', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' },
  P2: { label: 'High', color: 'text-warning', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  P3: { label: 'Medium', color: 'text-info', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  P4: { label: 'Low', color: 'text-foreground-muted', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30' },
} as const

export const TASK_STATUS_CONFIG = {
  BACKLOG: { label: 'Backlog', color: 'text-foreground-muted' },
  TODO: { label: 'To Do', color: 'text-foreground-secondary' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-info' },
  REVIEW: { label: 'Review', color: 'text-warning' },
  DONE: { label: 'Done', color: 'text-success' },
} as const

export const EVENT_CATEGORY_COLORS = {
  MEETING: '#6366F1',
  DEEP_WORK: '#3B82F6',
  PERSONAL: '#10B981',
  CONTENT: '#F59E0B',
  ADMIN: '#9CA3AF',
  HEALTH: '#EF4444',
  SOCIAL: '#EC4899',
} as const

export const OLLAMA_MODELS = {
  general: process.env.OLLAMA_MODEL_GENERAL || 'llama3.1:8b',
  structured: process.env.OLLAMA_MODEL_STRUCTURED || 'mistral:7b',
  embed: process.env.OLLAMA_MODEL_EMBED || 'nomic-embed-text',
} as const

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const EMBEDDING_DIMENSION = 768
export const CHUNK_SIZE = 500 // tokens
