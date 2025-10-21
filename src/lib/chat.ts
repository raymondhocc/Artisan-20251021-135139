import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo } from '../../worker/types';
export interface CanvasProject {
  id: string;
  title: string;
  canvasState: string;
  lastModified: number;
}
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'alibaba/qwen-image-turbo', name: 'Qwen-Image (Generate)' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
    }
    this.sessionId = sessionId;
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  async sendMessage(message: string, model?: string, onChunk?: (chunk: string) => void): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: !!onChunk }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (chunk) onChunk(chunk);
          }
        } finally {
          reader.releaseLock();
        }
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get messages:', error);
      return { success: false, error: 'Failed to load messages' };
    }
  }
  getSessionId(): string {
    return this.sessionId;
  }
  async createSession(title?: string, sessionId?: string, firstMessage?: string): Promise<{ success: boolean; data?: { sessionId: string; title: string }; error?: string }> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sessionId, firstMessage })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create session' };
    }
  }
  async listSessions(): Promise<{ success: boolean; data?: SessionInfo[]; error?: string }> {
    try {
      const response = await fetch('/api/sessions');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to list sessions' };
    }
  }
  async deleteSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to delete session' };
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update session title' };
    }
  }
  async clearAllSessions(): Promise<{ success: boolean; data?: { deletedCount: number }; error?: string }> {
    try {
      const response = await fetch('/api/sessions', { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to clear all sessions' };
    }
  }
  async updateModel(model: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to update model:', error);
      return { success: false, error: 'Failed to update model' };
    }
  }
  async updateSystemPrompt(prompt: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/system-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update system prompt:', error);
      return { success: false, error: 'Failed to update system prompt' };
    }
  }
  // Project Management Methods
  async saveProject(projectId: string, canvasState: string, title?: string): Promise<{ success: boolean; data?: { projectId: string }; error?: string }> {
    try {
      const response = await fetch(`/api/projects/${this.sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, canvasState, title }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to save project' };
    }
  }
  async loadProject(projectId: string): Promise<{ success: boolean; data?: CanvasProject; error?: string }> {
    try {
      const response = await fetch(`/api/projects/${this.sessionId}/${projectId}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to load project' };
    }
  }
  async listProjects(): Promise<{ success: boolean; data?: CanvasProject[]; error?: string }> {
    try {
      const response = await fetch(`/api/projects/${this.sessionId}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to list projects' };
    }
  }
  async deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/projects/${this.sessionId}/${projectId}`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to delete project' };
    }
  }
}
export const chatService = new ChatService();
export const formatTime = (timestamp: number): string => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const renderToolCall = (toolCall: ToolCall): string => {
  const result = toolCall.result as WeatherResult | MCPResult | ErrorResult | { generatedImageUrl?: string; imageUrls?: string[]; message?: string } | undefined;
  if (!result) return `⚠️ ${toolCall.name}: No result`;
  if ('error' in result) return `❌ ${toolCall.name}: ${result.error}`;
  if ('generatedImageUrl' in result && result.generatedImageUrl) return `🎨 ${toolCall.name}: Image generated!`;
  if ('message' in result && result.message) return `✅ ${toolCall.name}: ${result.message}`;
  if ('content' in result) return `🔧 ${toolCall.name}: Executed`;
  if (toolCall.name === 'get_weather') {
    const weather = result as WeatherResult;
    return `🌤️ Weather in ${weather.location}: ${weather.temperature}°C, ${weather.condition}`;
  }
  return `🔧 ${toolCall.name}: Done`;
};