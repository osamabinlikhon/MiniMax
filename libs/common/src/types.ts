import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Base schemas
export const BaseSchema = z.object({
  id: z.string().uuid().default(() => uuidv4()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const StatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
  'paused',
]);

// Agent types
export const AgentTypeSchema = z.enum([
  'web-developer',
  'presentation-creator',
  'research-analyst',
  'multimedia-generator',
  'mcp-coordinator',
  'planner',
  'coordinator',
]);

export const AgentCapabilitySchema = z.object({
  type: z.string(),
  description: z.string(),
  timeout: z.number().optional(),
  resourceRequirements: z.object({
    memory: z.number().optional(),
    cpu: z.number().optional(),
  }).optional(),
});

export const AgentSchema = BaseSchema.extend({
  type: AgentTypeSchema,
  name: z.string(),
  description: z.string().optional(),
  capabilities: z.array(AgentCapabilitySchema),
  status: StatusSchema.default('pending'),
  config: z.record(z.any()).optional(),
  currentTasks: z.array(z.string()).default([]),
  maxConcurrentTasks: z.number().default(1),
  healthCheckUrl: z.string().optional(),
  lastHeartbeat: z.date().optional(),
});

// Task types
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const TaskTypeSchema = z.enum([
  'planning',
  'execution',
  'coordination',
  'validation',
  'cleanup',
]);

export const TaskSchema = BaseSchema.extend({
  type: TaskTypeSchema,
  title: z.string(),
  description: z.string(),
  agentId: z.string().uuid(),
  planId: z.string().uuid(),
  priority: TaskPrioritySchema.default('medium'),
  status: StatusSchema.default('pending'),
  dependencies: z.array(z.string().uuid()).default([]),
  inputs: z.record(z.any()).default({}),
  outputs: z.record(z.any()).default({}),
  error: z.string().optional(),
  estimatedDuration: z.number().optional(),
  actualDuration: z.number().optional(),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  metadata: z.record(z.any()).default({}),
});

// Plan types
export const PlanTypeSchema = z.enum(['simple', 'complex', 'adaptive']);

export const PlanSchema = BaseSchema.extend({
  title: z.string(),
  description: z.string(),
  type: PlanTypeSchema,
  userId: z.string().uuid(),
  status: StatusSchema.default('pending'),
  tasks: z.array(z.string().uuid()).default([]),
  context: z.record(z.any()).default({}),
  constraints: z.object({
    maxDuration: z.number().optional(),
    maxCost: z.number().optional(),
    requiredCapabilities: z.array(z.string()).optional(),
  }).optional(),
  results: z.record(z.any()).default({}),
  progress: z.object({
    total: z.number().default(0),
    completed: z.number().default(0),
    failed: z.number().default(0),
    percentage: z.number().default(0),
  }).default({ total: 0, completed: 0, failed: 0, percentage: 0 }),
});

// User types
export const UserRoleSchema = z.enum(['user', 'admin', 'manager']);

export const UserSchema = BaseSchema.extend({
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema.default('user'),
  credits: z.number().default(0),
  limits: z.object({
    dailyRequests: z.number().default(100),
    monthlyRequests: z.number().default(1000),
    maxConcurrentPlans: z.number().default(3),
  }).default({}),
  preferences: z.object({
    darkMode: z.boolean().default(false),
    customMode: z.boolean().default(false),
    lightningMode: z.boolean().default(true),
    notifications: z.boolean().default(true),
  }).default({}),
});

// Session types
export const SessionSchema = BaseSchema.extend({
  userId: z.string().uuid(),
  planId: z.string().uuid().optional(),
  branchName: z.string().optional(),
  checkpointId: z.string().optional(),
  isActive: z.boolean().default(true),
  context: z.record(z.any()).default({}),
});

// Checkpoint types
export const CheckpointSchema = BaseSchema.extend({
  planId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  snapshot: z.record(z.any()),
  isRestorePoint: z.boolean().default(false),
});

// Message types for agent communication
export const MessageTypeSchema = z.enum([
  'task-assignment',
  'task-update',
  'agent-heartbeat',
  'agent-status',
  'plan-update',
  'error',
  'result',
]);

export const MessageSchema = BaseSchema.extend({
  type: MessageTypeSchema,
  senderId: z.string().uuid(),
  receiverId: z.string().uuid().optional(),
  content: z.record(z.any()),
  correlationId: z.string().uuid().optional(),
  replyTo: z.string().uuid().optional(),
});

// Tool types
export const ToolTypeSchema = z.enum([
  'web-scraper',
  'api-client',
  'file-processor',
  'ai-model',
  'database',
  'external-service',
]);

export const ToolSchema = BaseSchema.extend({
  name: z.string(),
  type: ToolTypeSchema,
  description: z.string(),
  config: z.record(z.any()),
  isSandboxed: z.boolean().default(true),
  timeout: z.number().default(30000),
  rateLimits: z.object({
    requests: z.number().optional(),
    windowMs: z.number().optional(),
  }).optional(),
});

// Web Development specific types
export const WebProjectSchema = BaseSchema.extend({
  name: z.string(),
  description: z.string(),
  framework: z.enum(['nextjs', 'react', 'vue', 'svelte']),
  features: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  deploymentTarget: z.enum(['vercel', 'netlify', 'railway']).default('vercel'),
  buildStatus: StatusSchema.default('pending'),
  deploymentUrl: z.string().optional(),
});

// Presentation types
export const PresentationSchema = BaseSchema.extend({
  title: z.string(),
  content: z.record(z.any()),
  format: z.enum(['pptx', 'pdf', 'html']).default('pptx'),
  theme: z.string().default('default'),
  isGenerating: z.boolean().default(false),
  downloadUrl: z.string().optional(),
});

// Research types
export const ResearchQuerySchema = z.object({
  query: z.string(),
  sources: z.array(z.string()).default([]),
  maxResults: z.number().default(10),
  timeRange: z.string().optional(),
});

export const ResearchResultSchema = BaseSchema.extend({
  query: ResearchQuerySchema,
  results: z.array(z.record(z.any())),
  analysis: z.record(z.any()).optional(),
  charts: z.array(z.string()).optional(),
  citations: z.array(z.string()).default([]),
});

// Multimedia types
export const MediaTypeSchema = z.enum(['image', 'audio', 'video', 'text']);

export const MediaGenerationRequestSchema = BaseSchema.extend({
  type: MediaTypeSchema,
  prompt: z.string(),
  parameters: z.record(z.any()).default({}),
  model: z.string().default('default'),
});

export const MediaGenerationResultSchema = BaseSchema.extend({
  requestId: z.string().uuid(),
  status: StatusSchema,
  result: z.record(z.any()).optional(),
  error: z.string().optional(),
  processingTime: z.number().optional(),
});

// MCP types
export const MCPTypeSchema = z.enum(['custom', 'github', 'slack', 'figma', 'google-maps']);

export const MCPSchema = BaseSchema.extend({
  name: z.string(),
  type: MCPTypeSchema,
  description: z.string(),
  config: z.record(z.any()),
  isEnabled: z.boolean().default(true),
  usage: z.object({
    requests: z.number().default(0),
    lastUsed: z.date().optional(),
  }).default({}),
});

// Type exports
export type Base = z.infer<typeof BaseSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type AgentType = z.infer<typeof AgentTypeSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type User = z.infer<typeof UserSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Checkpoint = z.infer<typeof CheckpointSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Tool = z.infer<typeof ToolSchema>;
export type WebProject = z.infer<typeof WebProjectSchema>;
export type Presentation = z.infer<typeof PresentationSchema>;
export type ResearchQuery = z.infer<typeof ResearchQuerySchema>;
export type ResearchResult = z.infer<typeof ResearchResultSchema>;
export type MediaType = z.infer<typeof MediaTypeSchema>;
export type MediaGenerationRequest = z.infer<typeof MediaGenerationRequestSchema>;
export type MediaGenerationResult = z.infer<typeof MediaGenerationResultSchema>;
export type MCPType = z.infer<typeof MCPTypeSchema>;
export type MCP = z.infer<typeof MCPSchema>;
