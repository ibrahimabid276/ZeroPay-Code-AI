import { ExtensionPermission } from '@/types/extension';

// Permission descriptions for user-facing UI
export const PERMISSION_DESCRIPTIONS: Record<ExtensionPermission, {
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
}> = {
  'workspace:read': {
    title: 'Read Workspace',
    description: 'Access workspace folders and configuration',
    risk: 'low',
  },
  'workspace:write': {
    title: 'Write to Workspace',
    description: 'Modify workspace settings and state',
    risk: 'medium',
  },
  'files:read': {
    title: 'Read Files',
    description: 'Read project files and search content',
    risk: 'low',
  },
  'files:write': {
    title: 'Write Files',
    description: 'Create, modify, and delete project files',
    risk: 'high',
  },
  'terminal:execute': {
    title: 'Execute Terminal Commands',
    description: 'Run commands in the integrated terminal',
    risk: 'high',
  },
  'terminal:read': {
    title: 'Read Terminal Output',
    description: 'Access terminal output and history',
    risk: 'medium',
  },
  'github:read': {
    title: 'Read GitHub Data',
    description: 'Access repositories, branches, and commits',
    risk: 'medium',
  },
  'github:write': {
    title: 'Write to GitHub',
    description: 'Create commits, branches, and pull requests',
    risk: 'high',
  },
  'database:read': {
    title: 'Read Database',
    description: 'Execute queries and read database tables',
    risk: 'medium',
  },
  'database:write': {
    title: 'Write to Database',
    description: 'Modify database tables and execute write queries',
    risk: 'high',
  },
  'ai:access': {
    title: 'Access AI Models',
    description: 'Use AI chat and code completion features',
    risk: 'low',
  },
  'network:http': {
    title: 'Network Access',
    description: 'Make HTTP requests to external services',
    risk: 'medium',
  },
  'notebooks:read': {
    title: 'Read Notebooks',
    description: 'Access notebook cells and outputs',
    risk: 'low',
  },
  'notebooks:write': {
    title: 'Write to Notebooks',
    description: 'Create and modify notebook cells',
    risk: 'medium',
  },
  'settings:read': {
    title: 'Read Settings',
    description: 'Access user and workspace settings',
    risk: 'low',
  },
  'settings:write': {
    title: 'Write Settings',
    description: 'Modify user and workspace settings',
    risk: 'medium',
  },
};

// Permission categories for grouping in UI
export const PERMISSION_CATEGORIES = {
  workspace: ['workspace:read', 'workspace:write'],
  files: ['files:read', 'files:write'],
  terminal: ['terminal:execute', 'terminal:read'],
  github: ['github:read', 'github:write'],
  database: ['database:read', 'database:write'],
  ai: ['ai:access'],
  network: ['network:http'],
  notebooks: ['notebooks:read', 'notebooks:write'],
  settings: ['settings:read', 'settings:write'],
};

/**
 * Validate if a permission string is valid
 */
export function isValidPermission(permission: string): permission is ExtensionPermission {
  return Object.keys(PERMISSION_DESCRIPTIONS).includes(permission);
}

/**
 * Get permissions by risk level
 */
export function getPermissionsByRisk(risk: 'low' | 'medium' | 'high'): ExtensionPermission[] {
  return Object.entries(PERMISSION_DESCRIPTIONS)
    .filter(([_, info]) => info.risk === risk)
    .map(([perm]) => perm as ExtensionPermission);
}

/**
 * Check if permissions conflict with each other
 */
export function checkPermissionConflicts(permissions: ExtensionPermission[]): string[] {
  const conflicts: string[] = [];
  
  // Example: If requesting files:write, should also have files:read
  if (permissions.includes('files:write') && !permissions.includes('files:read')) {
    conflicts.push('files:write requires files:read');
  }
  
  if (permissions.includes('github:write') && !permissions.includes('github:read')) {
    conflicts.push('github:write requires github:read');
  }
  
  if (permissions.includes('database:write') && !permissions.includes('database:read')) {
    conflicts.push('database:write requires database:read');
  }
  
  return conflicts;
}

/**
 * Calculate permission risk score
 */
export function calculatePermissionRisk(permissions: ExtensionPermission[]): number {
  const riskScores = {
    low: 1,
    medium: 2,
    high: 3,
  };
  
  return permissions.reduce((score, perm) => {
    const info = PERMISSION_DESCRIPTIONS[perm];
    return score + (info ? riskScores[info.risk] : 0);
  }, 0);
}

/**
 * Get risk level label
 */
export function getRiskLabel(permissions: ExtensionPermission[]): string {
  const score = calculatePermissionRisk(permissions);
  
  if (score <= 3) return 'Low Risk';
  if (score <= 6) return 'Medium Risk';
  return 'High Risk';
}

/**
 * Check if permission is granted
 */
export function isPermissionGranted(
  grantedPermissions: ExtensionPermission[],
  requiredPermission: ExtensionPermission
): boolean {
  return grantedPermissions.includes(requiredPermission);
}

/**
 * Validate permissions against security level
 */
export function validateSecurityLevel(
  permissions: ExtensionPermission[],
  securityLevel: 'low' | 'medium' | 'high' | 'strict'
): boolean {
  const highRiskPerms = getPermissionsByRisk('high');
  const mediumRiskPerms = getPermissionsByRisk('medium');
  
  // Strict: No high risk permissions
  if (securityLevel === 'strict') {
    return !permissions.some(p => highRiskPerms.includes(p));
  }
  
  // High: Max 2 high risk permissions
  if (securityLevel === 'high') {
    const highCount = permissions.filter(p => highRiskPerms.includes(p)).length;
    return highCount <= 2;
  }
  
  // Medium: No more than 5 medium risk permissions
  if (securityLevel === 'medium') {
    const mediumCount = permissions.filter(p => mediumRiskPerms.includes(p)).length;
    return mediumCount <= 5;
  }
  
  // Low: No restrictions
  return true;
}

/**
 * Filter permissions by category
 */
export function getPermissionsByCategory(category: keyof typeof PERMISSION_CATEGORIES): ExtensionPermission[] {
  return PERMISSION_CATEGORIES[category] as ExtensionPermission[];
}

/**
 * Group permissions for display
 */
export function groupPermissions(permissions: ExtensionPermission[]): Record<string, ExtensionPermission[]> {
  const grouped: Record<string, ExtensionPermission[]> = {};
  
  for (const perm of permissions) {
    const category = perm.split(':')[0];
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(perm);
  }
  
  return grouped;
}
