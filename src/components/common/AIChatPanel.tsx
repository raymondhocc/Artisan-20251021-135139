import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Clock, Wrench, Send, Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { chatService, formatTime, renderToolCall } from '@/lib/chat';
import type { ChatState, ToolCall } from '../../../worker/types';
import { ScrollArea } from '../ui/scroll-area';
interface AIChatPanelProps {
  onAIGeneratedImage?: (imageUrl: string) => void;
}
export function AIChatPanel({ onAIGeneratedImage }: AIChatPanelProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.streamingMessage]);
  const loadCurrentSession = useCallback(async () => {
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(prev => ({ ...prev, ...response.data }));
    }
  }, []);
  useEffect(() => {
    loadCurrentSession();
  }, [loadCurrentSession]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isProcessing) return;
    const message = input.trim();
    setInput('');
    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: message, timestamp: Date.now() };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, userMessage], streamingMessage: '' }));
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({ ...prev, streamingMessage: (prev.streamingMessage || '') + chunk }));
    });
    await loadCurrentSession();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const getGeneratedImageUrl = (toolCall: ToolCall): string | null => {
    const result = toolCall.result as { generatedImageUrl?: string };
    return result?.generatedImageUrl || null;
  };
  return (
    <Card className="h-full flex flex-col shadow-lg border-artisan-border transition-all duration-300">
      <CardHeader className="flex flex-row items-center gap-3 p-4 border-b">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="font-playfair font-bold text-xl">AI Assistant</h2>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {chatState.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && <Bot className="w-8 h-8 rounded-full bg-muted p-1.5 flex-shrink-0" />}
                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-artisan-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap mb-2">{msg.content}</p>
                  {msg.toolCalls?.map(tool => {
                    const imageUrl = getGeneratedImageUrl(tool);
                    return imageUrl ? (
                      <div key={tool.id} className="mt-2 relative group">
                        <img src={imageUrl} alt="AI Generated" className="rounded-lg border" />
                        {onAIGeneratedImage && (
                          <Button size="sm" className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity btn-gradient" onClick={() => onAIGeneratedImage(imageUrl)}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Add to Canvas
                          </Button>
                        )}
                      </div>
                    ) : null;
                  })}
                  <div className="flex items-center gap-2 text-xs opacity-70 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(msg.timestamp)}</span>
                  </div>
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-current/20 space-y-1">
                      {msg.toolCalls.map((tool, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          <Wrench className="w-3 h-3 mr-1.5" /> {renderToolCall(tool)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && <User className="w-8 h-8 rounded-full bg-artisan-secondary text-secondary-foreground p-1.5 flex-shrink-0" />}
              </motion.div>
            ))}
            {chatState.streamingMessage && (
              <div className="flex gap-3 justify-start">
                <Bot className="w-8 h-8 rounded-full bg-muted p-1.5 flex-shrink-0" />
                <div className="bg-muted p-3 rounded-2xl max-w-[80%] rounded-bl-none shadow-sm">
                  <p className="whitespace-pre-wrap">{chatState.streamingMessage}<span className="animate-pulse">|</span></p>
                </div>
              </div>
            )}
            {chatState.isProcessing && !chatState.streamingMessage && chatState.messages.length > 0 && (
              <div className="flex gap-3 justify-start">
                <Bot className="w-8 h-8 rounded-full bg-muted p-1.5 flex-shrink-0" />
                <div className="bg-muted p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex space-x-1.5">
                    {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 'Generate an image of a cat astronaut'"
            className="pr-12 min-h-[48px] rounded-full resize-none py-3 px-5"
            rows={1}
            disabled={chatState.isProcessing}
          />
          <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-9 h-9" disabled={!input.trim() || chatState.isProcessing}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}