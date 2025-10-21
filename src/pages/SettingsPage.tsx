import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cloud, Database, Bot, Loader2 } from 'lucide-react';
import { chatService, MODELS } from '@/lib/chat';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useDebounce } from 'react-use';
export function SettingsPage() {
  const [language, setLanguage] = useState('en');
  const [currentModel, setCurrentModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  useEffect(() => {
    chatService.getMessages().then(res => {
      if (res.success && res.data) {
        setCurrentModel(res.data.model);
        setSystemPrompt(res.data.systemPrompt || '');
      }
    });
  }, []);
  const handleModelChange = async (modelId: string) => {
    setCurrentModel(modelId);
    const res = await chatService.updateModel(modelId);
    if (res.success) {
      toast.success(`AI Model updated to ${MODELS.find(m => m.id === modelId)?.name || modelId}`);
    } else {
      toast.error('Failed to update model', { description: res.error });
    }
  };
  const saveSystemPrompt = useCallback(async (prompt: string) => {
    setIsSavingPrompt(true);
    const res = await chatService.updateSystemPrompt(prompt);
    if (res.success) {
      toast.success('System prompt updated successfully.');
    } else {
      toast.error('Failed to update system prompt.', { description: res.error });
    }
    setIsSavingPrompt(false);
  }, []);
  useDebounce(() => {
    if (systemPrompt !== undefined) {
      saveSystemPrompt(systemPrompt);
    }
  }, 1000, [systemPrompt]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-16 md:py-24 lg:py-32 space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-fredericka text-artisan-text-primary">Settings</h1>
          <p className="text-lg text-artisan-text-secondary max-w-2xl mx-auto">
            Configure your Artisan Canvas experience.
          </p>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-artisan-border shadow-lg">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-2xl font-playfair">Theme Preference</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Label className="text-base font-medium text-artisan-text-primary">
                Choose your preferred theme:
              </Label>
              <ThemeToggle />
            </CardContent>
          </Card>
          <Card className="border-artisan-border shadow-lg">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-2xl font-playfair">Language Selection</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Label htmlFor="language-select" className="text-base font-medium text-artisan-text-primary">
                Select your display language:
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language-select" className="w-[220px] h-9 rounded-md border-artisan-border bg-artisan-card-bg text-artisan-text-primary hover:bg-muted/80 transition-colors duration-300">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className="bg-artisan-card-bg border-artisan-border">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh-Hans">简体中文 (Simplified Chinese)</SelectItem>
                  <SelectItem value="zh-Hant">繁體中文 (Traditional Chinese)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                (Full language support is a future feature.)
              </p>
            </CardContent>
          </Card>
          <Card className="border-artisan-border shadow-lg md:col-span-2 lg:col-span-1">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-2xl font-playfair flex items-center gap-3">
                <Cloud className="h-6 w-6 text-artisan-secondary" />
                Data & Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm text-muted-foreground">
              <p>This application uses Cloudflare Durable Objects for project data and R2 for image storage.</p>
              <p>For security and architectural reasons, the R2 bucket is configured at deployment time and cannot be changed from this interface.</p>
              <p>The serverless nature of Cloudflare Workers does not support file-based databases like SQLite3. Our cloud-native stack ensures global performance and scalability.</p>
            </CardContent>
          </Card>
        </div>
        <Card className="border-artisan-border shadow-lg">
          <CardHeader className="p-6 border-b">
            <CardTitle className="text-2xl font-playfair flex items-center gap-3">
              <Bot className="h-6 w-6 text-artisan-primary" />
              AI Configuration
            </CardTitle>
            <CardDescription>Customize the behavior of your AI assistant.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label htmlFor="llm-select" className="text-base font-medium text-artisan-text-primary">
                Large Language Model (LLM)
              </Label>
              <Select value={currentModel} onValueChange={handleModelChange}>
                <SelectTrigger id="llm-select" className="w-full h-9 rounded-md border-artisan-border bg-artisan-card-bg text-artisan-text-primary hover:bg-muted/80 transition-colors duration-300">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-artisan-card-bg border-artisan-border">
                  {MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Choose the AI model that powers the chat assistant.</p>
            </div>
            <div className="space-y-4">
              <Label htmlFor="system-prompt" className="text-base font-medium text-artisan-text-primary flex items-center gap-2">
                Custom System Prompt
                {isSavingPrompt && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </Label>
              <Textarea
                id="system-prompt"
                placeholder="e.g., You are a whimsical and creative design assistant..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground">Define the AI's personality and instructions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}