export type PermissionScope = 'read' | 'write' | 'execute' | 'admin';
export type PermissionCategory = 'file' | 'shell' | 'git' | 'network' | 'system' | 'mcp';

export interface Permission {
	id: string;
	name: string;
	description: string;
	category: PermissionCategory;
	scope: PermissionScope;
	dangerous: boolean;
}

export interface PermissionGroup {
	id: string;
	name: string;
	permissions: string[];
}

export const PERMISSIONS: Permission[] = [
	{
		id: 'file:read',
		name: 'Read Files',
		description: 'Read any file in the project',
		category: 'file',
		scope: 'read',
		dangerous: false,
	},
	{
		id: 'file:write',
		name: 'Write Files',
		description: 'Create, modify, or delete files',
		category: 'file',
		scope: 'write',
		dangerous: true,
	},
	{
		id: 'file:delete',
		name: 'Delete Files',
		description: 'Delete files from filesystem',
		category: 'file',
		scope: 'write',
		dangerous: true,
	},
	{
		id: 'shell:execute',
		name: 'Execute Commands',
		description: 'Run shell commands',
		category: 'shell',
		scope: 'execute',
		dangerous: true,
	},
	{
		id: 'shell:sudo',
		name: 'Sudo Access',
		description: 'Run commands with elevated privileges',
		category: 'shell',
		scope: 'admin',
		dangerous: true,
	},
	{
		id: 'git:read',
		name: 'Git Read',
		description: 'Read git repository information',
		category: 'git',
		scope: 'read',
		dangerous: false,
	},
	{
		id: 'git:execute',
		name: 'Git Execute',
		description: 'Execute git commands (commit, push, etc.)',
		category: 'git',
		scope: 'execute',
		dangerous: true,
	},
	{
		id: 'network:fetch',
		name: 'Network Fetch',
		description: 'Make HTTP/HTTPS requests',
		category: 'network',
		scope: 'read',
		dangerous: false,
	},
	{
		id: 'network:connect',
		name: 'Network Connect',
		description: 'Connect to external services',
		category: 'network',
		scope: 'execute',
		dangerous: false,
	},
	{
		id: 'system:env',
		name: 'Environment Variables',
		description: 'Read environment variables',
		category: 'system',
		scope: 'read',
		dangerous: false,
	},
	{
		id: 'system:settings',
		name: 'System Settings',
		description: 'Modify system configuration',
		category: 'system',
		scope: 'admin',
		dangerous: true,
	},
	{
		id: 'mcp:execute',
		name: 'MCP Tools',
		description: 'Use MCP server tools',
		category: 'mcp',
		scope: 'execute',
		dangerous: false,
	},
];

export const PERMISSION_GROUPS: PermissionGroup[] = [
	{
		id: 'basic',
		name: 'Basic',
		permissions: ['file:read', 'network:fetch', 'git:read'],
	},
	{
		id: 'development',
		name: 'Development',
		permissions: ['file:read', 'file:write', 'shell:execute', 'git:execute'],
	},
	{
		id: 'full',
		name: 'Full Access',
		permissions: PERMISSIONS.map((p) => p.id),
	},
	{
		id: 'restricted',
		name: 'Restricted',
		permissions: ['file:read', 'git:read'],
	},
];

export interface UserPermissions {
	granted: string[];
	denied: string[];
	groups: string[];
}

export const DEFAULT_PERMISSIONS: UserPermissions = {
	granted: [],
	denied: [],
	groups: ['basic'],
};

export const getPermission = (id: string): Permission | undefined => {
	return PERMISSIONS.find((p) => p.id === id);
};

export const getPermissionsByCategory = (category: PermissionCategory): Permission[] => {
	return PERMISSIONS.filter((p) => p.category === category);
};

export const resolvePermissions = (userPerms: UserPermissions): string[] => {
	const resolved = new Set<string>();
	
	for (const groupId of userPerms.groups) {
		const group = PERMISSION_GROUPS.find((g) => g.id === groupId);
		if (group) {
			group.permissions.forEach((p) => resolved.add(p));
		}
	}
	
	userPerms.granted.forEach((p) => resolved.add(p));
	userPerms.denied.forEach((p) => resolved.delete(p));
	
	return Array.from(resolved);
};

export const hasPermission = (userPerms: UserPermissions, permissionId: string): boolean => {
	const resolved = resolvePermissions(userPerms);
	return resolved.includes(permissionId);
};
