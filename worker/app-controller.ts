import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo } from './types';
import type { Env } from './core-utils';
interface CanvasProject {
  id: string;
  title: string;
  canvasState: string;
  lastModified: number;
}
// 🤖 AI Extension Point: Add session management features
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private projects = new Map<string, CanvasProject>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const storedSessions = await this.ctx.storage.get<Record<string, SessionInfo>>('sessions') || {};
      this.sessions = new Map(Object.entries(storedSessions));
      const storedProjects = await this.ctx.storage.get<Record<string, CanvasProject>>('projects') || {};
      this.projects = new Map(Object.entries(storedProjects));
      this.loaded = true;
    }
  }
  private async persistSessions(): Promise<void> {
    await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
  }
  private async persistProjects(): Promise<void> {
    await this.ctx.storage.put('projects', Object.fromEntries(this.projects));
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persistSessions();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persistSessions();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persistSessions();
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persistSessions();
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    await this.ensureLoaded();
    return this.sessions.get(sessionId) || null;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persistSessions();
    return count;
  }
  // R2 Image Management Methods
  async uploadR2Image(sessionId: string, filename: string, data: ArrayBuffer, contentType: string): Promise<string> {
    if (!this.env.R2_BUCKET) throw new Error('R2_BUCKET binding not found');
    const key = `${sessionId}/${filename}`;
    await this.env.R2_BUCKET.put(key, data, {
      httpMetadata: { contentType },
    });
    const publicUrl = this.env.R2_BUCKET_URL || '';
    return `${publicUrl}/${key}`;
  }
  async listR2Images(sessionId: string): Promise<string[]> {
    if (!this.env.R2_BUCKET) throw new Error('R2_BUCKET binding not found');
    const { objects } = await this.env.R2_BUCKET.list({ prefix: `${sessionId}/` });
    const publicUrl = this.env.R2_BUCKET_URL || '';
    return objects.map(obj => `${publicUrl}/${obj.key}`);
  }
  async deleteR2Image(sessionId: string, filename: string): Promise<boolean> {
    if (!this.env.R2_BUCKET) throw new Error('R2_BUCKET binding not found');
    const key = `${sessionId}/${filename}`;
    await this.env.R2_BUCKET.delete(key);
    return true;
  }
  // Canvas Project Management
  async saveCanvasProject(sessionId: string, projectId: string, canvasState: string, title?: string): Promise<CanvasProject> {
    await this.ensureLoaded();
    const now = Date.now();
    const projectKey = `${sessionId}-${projectId}`;
    const existingProject = this.projects.get(projectKey);
    const project: CanvasProject = {
      id: projectId,
      title: title || existingProject?.title || `Project ${projectId.substring(0, 8)}`,
      canvasState,
      lastModified: now,
    };
    this.projects.set(projectKey, project);
    await this.persistProjects();
    return project;
  }
  async loadCanvasProject(sessionId: string, projectId: string): Promise<CanvasProject | null> {
    await this.ensureLoaded();
    const projectKey = `${sessionId}-${projectId}`;
    return this.projects.get(projectKey) || null;
  }
  async listCanvasProjects(sessionId: string): Promise<CanvasProject[]> {
    await this.ensureLoaded();
    const userProjects: CanvasProject[] = [];
    for (const [key, project] of this.projects.entries()) {
      if (key.startsWith(`${sessionId}-`)) {
        userProjects.push(project);
      }
    }
    return userProjects.sort((a, b) => b.lastModified - a.lastModified);
  }
  async deleteCanvasProject(sessionId: string, projectId: string): Promise<boolean> {
    await this.ensureLoaded();
    const projectKey = `${sessionId}-${projectId}`;
    const deleted = this.projects.delete(projectKey);
    if (deleted) await this.persistProjects();
    return deleted;
  }
}