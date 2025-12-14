'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Moon, Sun, Settings, Zap, GitBranch, Code2, Image, FileText, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mode, setMode] = useState<'standard' | 'lightning' | 'custom'>('standard');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, sessionId }),
      });

      const data = await response.json();
      
      if (data.sessionId) setSessionId(data.sessionId);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not process your request.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: Code2, label: 'Build App', prompt: 'Help me build a web application' },
    { icon: FileText, label: 'Create Presentation', prompt: 'Create a presentation about' },
    { icon: Search, label: 'Research', prompt: 'Research and analyze' },
    { icon: Image, label: 'Generate Media', prompt: 'Generate an image of' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MiniMax</h1>
            <p className="text-xs text-muted-foreground">AI Multi-Agent System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setMode('lightning')}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
                mode === 'lightning' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              Lightning
            </button>
            <button
              onClick={() => setMode('standard')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                mode === 'standard' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
                mode === 'custom' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Custom
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Branch Sessions */}
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <GitBranch className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Welcome to MiniMax</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Your AI-powered multi-agent system. I can help you build apps, create presentations,
                research topics, and generate media.
              </p>
              {/* Core Capabilities */}
              <div className="w-full max-w-md mx-auto mb-6">
                <h3 className="text-sm font-semibold mb-3">Core Capabilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <Code2 className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <div className="text-sm font-medium">Full-Stack Web Development</div>
                      <div className="text-xs text-muted-foreground">Auth, Database, Stripe integration</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <FileText className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <div className="text-sm font-medium">Presentation Agent</div>
                      <div className="text-xs text-muted-foreground">HTML → PPTX export with preview</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <Search className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <div className="text-sm font-medium">Research & Analysis</div>
                      <div className="text-xs text-muted-foreground">Multi-source research & charts</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <Image className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <div className="text-sm font-medium">Multimedia Generation</div>
                      <div className="text-xs text-muted-foreground">Image, audio, and video generation</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary sm:col-span-2">
                    <GitBranch className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <div className="text-sm font-medium">MCP Ecosystem</div>
                      <div className="text-xs text-muted-foreground">Custom MCPs and pre-built integrations</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setInput(action.prompt)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <action.icon className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-secondary rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask MiniMax anything..."
              className="flex-1 bg-secondary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {mode === 'lightning' && '⚡ Lightning Mode: Fast, free responses'}
            {mode === 'standard' && '🚀 Standard Mode: Balanced performance'}
            {mode === 'custom' && '⚙️ Custom Mode: Configure your own agents'}
          </p>
        </div>
      </main>
    </div>
  );
}
