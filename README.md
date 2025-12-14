# 🚀 MiniMax Multi-Agent System

A general-purpose AI agent capable of completing complex, long-horizon tasks. Built with modern architecture for full-stack development, presentations, research, and multimedia generation.

## ✨ Features

### Core Capabilities
- 🌐 **Full-Stack Web Development** - Complete web apps with Auth, Database, Stripe integration
- 📊 **Presentation Agent** - HTML to PPTX export with real-time preview
- 🔬 **Research & Analysis** - Multi-source research, code analysis, chart generation
- 🎨 **Multimedia Generation** - Image, audio, video generation and editing
- 🔧 **MCP Ecosystem** - Custom MCP creation and pre-built integrations

### System Features
- 🌙 **Dark Mode** - Light, Dark, System themes
- ⚡ **Lightning Mode** - Fast, free responses with visible thinking
- ⚙️ **Custom Mode** - Configure your own subagents
- 🌿 **Branch Sessions** - Feature/bug fix management
- 🔄 **Version Control** - Checkpoints, edit & regenerate
- 💳 **Stripe Integration** - Payment solutions
- 🗄️ **Supabase Backend** - Database, auth, APIs

## 🏗️ Architecture

```
minimax-agent/
├── apps/
│   └── web/                  # Next.js 14 frontend
├── services/
│   ├── api/                  # Fastify API gateway
│   ├── planner/              # Hierarchical task planner
│   └── agent-worker/         # Agent orchestration
├── libs/
│   ├── common/               # Shared types & utilities
│   └── queue/                # BullMQ queue management
└── infrastructure/
    └── docker/               # Docker configurations
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (optional)
- Redis (for queue management)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/minimax-agent.git
cd minimax-agent

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development servers
pnpm dev
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables

```env
# API Keys
OPENROUTER_API_KEY=your_openrouter_key
GITHUB_TOKEN=your_github_token

# Database
DATABASE_URL=postgresql://minimax:password@localhost:5432/minimax

# Redis
REDIS_URL=redis://localhost:6379

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
```

## 📦 Services

### API Gateway (Port 3000)
Main entry point for all client requests. Handles authentication, rate limiting, and routing.

### Planner Service (Port 3001)
Breaks down complex goals into executable tasks using AI-powered planning.

### Agent Worker
Processes tasks from the queue. Can be scaled horizontally for parallel processing.

### Web Frontend (Port 3002)
Next.js 14 application with modern UI, real-time updates, and theming support.

## 🛠️ Development

### Running Individual Services

```bash
# Start API gateway
pnpm --filter @minimax/api dev

# Start planner
pnpm --filter @minimax/planner dev

# Start web frontend
pnpm --filter @minimax/web dev

# Start worker
pnpm --filter @minimax/agent-worker dev
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @minimax/web build
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @minimax/api test
```

## 🎯 API Endpoints

### Plans
- `POST /api/plans` - Create a new plan
- `GET /api/plans` - List all plans
- `GET /api/plans/:id` - Get plan by ID

### Chat
- `POST /api/chat` - Send message to AI assistant

### Tasks
- `POST /api/tasks/:id/execute` - Execute a task

### WebSocket
- `WS /ws` - Real-time updates

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Fastify](https://fastify.io/)
- Queue management with [BullMQ](https://docs.bullmq.io/)
- AI powered by [OpenRouter](https://openrouter.ai/)
