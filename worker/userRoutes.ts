import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            const request = new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            });
            // This is a workaround to pass the original URL to the agent
            // for cases where the agent needs to know its own full path.
            request.headers.set('X-Original-Url', c.req.url);
            return agent.fetch(request);
        } catch (error) {
            console.error('Agent routing error:', error);
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({ success: false, error: 'Failed to retrieve sessions' }, { status: 500 });
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const { title, sessionId: providedSessionId, firstMessage } = await c.req.json().catch(() => ({}));
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({ success: true, data: { sessionId, title: sessionTitle } });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({ success: false, error: 'Failed to create session' }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
        }
    });
    app.put('/api/sessions/:sessionId/title', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { title } = await c.req.json();
            if (!title || typeof title !== 'string') return c.json({ success: false, error: 'Title is required' }, { status: 400 });
            const controller = getAppController(c.env);
            const updated = await controller.updateSessionTitle(sessionId, title);
            if (!updated) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            return c.json({ success: true, data: { title } });
        } catch (error) {
            console.error('Failed to update session title:', error);
            return c.json({ success: false, error: 'Failed to update session title' }, { status: 500 });
        }
    });
    app.delete('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const deletedCount = await controller.clearAllSessions();
            return c.json({ success: true, data: { deletedCount } });
        } catch (error) {
            console.error('Failed to clear all sessions:', error);
            return c.json({ success: false, error: 'Failed to clear all sessions' }, { status: 500 });
        }
    });
    app.post('/api/r2/upload/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const formData = await c.req.formData();
            const file = formData.get('file') as File;
            if (!file) return c.json({ success: false, error: 'No file uploaded' }, { status: 400 });
            const arrayBuffer = await file.arrayBuffer();
            const controller = getAppController(c.env);
            const imageUrl = await controller.uploadR2Image(sessionId, file.name, arrayBuffer, file.type);
            return c.json({ success: true, data: { imageUrl, filename: file.name } });
        } catch (error) {
            console.error('R2 upload error:', error);
            if (error instanceof Error && error.message.includes('R2_BUCKET binding not found')) {
                return c.json({ success: false, error: 'R2 storage is not configured on the server.' }, { status: 500 });
            }
            return c.json({ success: false, error: 'Failed to upload image to R2' }, { status: 500 });
        }
    });
    app.get('/api/r2/list/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const controller = getAppController(c.env);
            const imageUrls = await controller.listR2Images(sessionId);
            return c.json({ success: true, data: { imageUrls } });
        } catch (error) {
            console.error('R2 list error:', error);
            if (error instanceof Error && error.message.includes('R2_BUCKET binding not found')) {
                return c.json({ success: false, error: 'R2 storage is not configured on the server.' }, { status: 500 });
            }
            return c.json({ success: false, error: 'Failed to list images from R2' }, { status: 500 });
        }
    });
    app.delete('/api/r2/delete/:sessionId/:filename', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const filename = c.req.param('filename');
            const controller = getAppController(c.env);
            const success = await controller.deleteR2Image(sessionId, filename);
            return c.json({ success: true, data: { deleted: success } });
        } catch (error) {
            console.error('R2 delete error:', error);
            if (error instanceof Error && error.message.includes('R2_BUCKET binding not found')) {
                return c.json({ success: false, error: 'R2 storage is not configured on the server.' }, { status: 500 });
            }
            return c.json({ success: false, error: 'Failed to delete image from R2' }, { status: 500 });
        }
    });
    app.post('/api/projects/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { projectId, canvasState, title } = await c.req.json();
            if (!projectId || !canvasState) return c.json({ success: false, error: 'Project ID and canvas state are required' }, { status: 400 });
            const controller = getAppController(c.env);
            const project = await controller.saveCanvasProject(sessionId, projectId, canvasState, title);
            return c.json({ success: true, data: { projectId: project.id } });
        } catch (error) {
            console.error('Save project error:', error);
            return c.json({ success: false, error: 'Failed to save project' }, { status: 500 });
        }
    });
    app.get('/api/projects/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const controller = getAppController(c.env);
            const projects = await controller.listCanvasProjects(sessionId);
            return c.json({ success: true, data: projects });
        } catch (error) {
            console.error('List projects error:', error);
            return c.json({ success: false, error: 'Failed to list projects' }, { status: 500 });
        }
    });
    app.get('/api/projects/:sessionId/:projectId', async (c) => {
        try {
            const { sessionId, projectId } = c.req.param();
            const controller = getAppController(c.env);
            const project = await controller.loadCanvasProject(sessionId, projectId);
            if (!project) return c.json({ success: false, error: 'Project not found' }, { status: 404 });
            return c.json({ success: true, data: project });
        } catch (error) {
            console.error('Load project error:', error);
            return c.json({ success: false, error: 'Failed to load project' }, { status: 500 });
        }
    });
    app.delete('/api/projects/:sessionId/:projectId', async (c) => {
        try {
            const { sessionId, projectId } = c.req.param();
            const controller = getAppController(c.env);
            const deleted = await controller.deleteCanvasProject(sessionId, projectId);
            if (!deleted) return c.json({ success: false, error: 'Project not found' }, { status: 404 });
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Delete project error:', error);
            return c.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
        }
    });
}