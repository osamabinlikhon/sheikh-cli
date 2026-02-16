import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface SessionMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
}

export interface Session {
	id: string;
	name: string;
	firstMessage: string;
	createdAt: number;
	updatedAt: number;
	messageCount: number;
	messages: SessionMessage[];
	model?: string;
}

export interface SessionMetadata {
	id: string;
	name: string;
	firstMessage: string;
	createdAt: number;
	updatedAt: number;
	messageCount: number;
	model?: string;
}

export class SessionManager {
	private sessionsDir: string;
	private sessions: Map<string, Session> = new Map();
	private currentSession: Session | null = null;

	constructor(baseDir?: string) {
		this.sessionsDir = baseDir || path.join(os.homedir(), '.sheikh', 'sessions');
		this.ensureDir();
	}

	private ensureDir(): void {
		if (!fs.existsSync(this.sessionsDir)) {
			fs.mkdirSync(this.sessionsDir, { recursive: true });
		}
	}

	private getSessionPath(id: string): string {
		return path.join(this.sessionsDir, `${id}.json`);
	}

	createSession(name?: string, model?: string): Session {
		const id = `session-${Date.now()}`;
		const session: Session = {
			id,
			name: name || `Session ${new Date().toLocaleString()}`,
			firstMessage: '',
			createdAt: Date.now(),
			updatedAt: Date.now(),
			messageCount: 0,
			messages: [],
			model,
		};
		this.sessions.set(id, session);
		this.currentSession = session;
		return session;
	}

	addMessage(sessionId: string, message: SessionMessage): void {
		let session = this.sessions.get(sessionId);
		if (!session) {
			session = this.createSession();
		}
		
		session.messages.push(message);
		session.messageCount = session.messages.length;
		session.updatedAt = Date.now();

		if (session.messageCount === 1 && message.role === 'user') {
			session.firstMessage = message.content.slice(0, 100);
		}

		this.saveSession(session);
		this.sessions.set(sessionId, session);
		this.currentSession = session;
	}

	saveSession(session: Session): void {
		const filePath = this.getSessionPath(session.id);
		fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
	}

	loadSession(id: string): Session | null {
		const filePath = this.getSessionPath(id);
		if (!fs.existsSync(filePath)) {
			return null;
		}
		const data = fs.readFileSync(filePath, 'utf-8');
		const session = JSON.parse(data) as Session;
		this.sessions.set(id, session);
		return session;
	}

	listSessions(): SessionMetadata[] {
		this.ensureDir();
		const files = fs.readdirSync(this.sessionsDir).filter(f => f.endsWith('.json'));
		const sessions: SessionMetadata[] = [];

		for (const file of files) {
			const id = file.replace('.json', '');
			const session = this.loadSession(id);
			if (session) {
				sessions.push({
					id: session.id,
					name: session.name,
					firstMessage: session.firstMessage,
					createdAt: session.createdAt,
					updatedAt: session.updatedAt,
					messageCount: session.messageCount,
					model: session.model,
				});
			}
		}

		return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
	}

	getSession(id: string): Session | null {
		return this.sessions.get(id) || this.loadSession(id);
	}

	getCurrentSession(): Session | null {
		return this.currentSession;
	}

	setCurrentSession(session: Session): void {
		this.currentSession = session;
	}

	deleteSession(id: string): boolean {
		const filePath = this.getSessionPath(id);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			this.sessions.delete(id);
			if (this.currentSession?.id === id) {
				this.currentSession = null;
			}
			return true;
		}
		return false;
	}

	searchSessions(query: string): SessionMetadata[] {
		const sessions = this.listSessions();
		const lowerQuery = query.toLowerCase();
		
		return sessions.filter(session => {
			const sessionData = this.getSession(session.id);
			if (!sessionData) return false;
			
			return sessionData.messages.some(m => 
				m.content.toLowerCase().includes(lowerQuery)
			);
		});
	}

	resumeSession(id: string): Session | null {
		const session = this.loadSession(id);
		if (session) {
			this.currentSession = session;
		}
		return session;
	}

	getLatestSession(): Session | null {
		const sessions = this.listSessions();
		if (sessions.length === 0) return null;
		return this.loadSession(sessions[0].id);
	}

	clearOldSessions(keepCount: number = 50): void {
		const sessions = this.listSessions();
		if (sessions.length > keepCount) {
			const toDelete = sessions.slice(keepCount);
			for (const session of toDelete) {
				this.deleteSession(session.id);
			}
		}
	}
}

export const sessionManager = new SessionManager();
