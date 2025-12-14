import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// In-memory session storage (use Redis/DB in production)
const sessions = new Map<string, { messages: any[]; createdAt: string }>();

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const currentSessionId = sessionId || crypto.randomUUID();
    let session = sessions.get(currentSessionId) || { messages: [], createdAt: new Date().toISOString() };

    session.messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'system',
          content: `You are MiniMax, an advanced AI multi-agent system capable of:
- 🌐 **Full-Stack Web Development** - Complete web apps with Auth, Database, Stripe integration
- 📊 **Presentation Agent** - HTML to PPTX export with real-time preview
- 🔬 **Research & Analysis** - Multi-source research, code analysis, chart generation
- 🎨 **Multimedia Generation** - Image, audio, and video generation and editing
- 🔧 **MCP Ecosystem** - Custom MCP creation and pre-built integrations

You have these special modes:
- ⚡ Lightning Mode: Fast, free responses for quick tasks
- 🚀 Standard Mode: Balanced performance
- ⚙️ Custom Mode: User-configured agent behavior

Be helpful, concise, and proactive. When asked to build something, provide complete, working code.
Format code blocks with proper syntax highlighting.
Ask clarifying questions when the task is ambiguous.`,
        },
        ...session.messages,
      ],
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not process that request.';
    session.messages.push({ role: 'assistant', content: response });
    sessions.set(currentSessionId, session);

    return NextResponse.json({
      sessionId: currentSessionId,
      response,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat', details: error.message },
      { status: 500 }
    );
  }
}
