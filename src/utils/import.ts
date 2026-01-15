/**
 * Dynamic Import Utility
 * 
 * Handles dynamic module imports with proper TypeScript support
 */

/**
 * Dynamically import a module
 * Works in both TypeScript and compiled JavaScript
 */
export async function dynamicImport<T = unknown>(modulePath: string): Promise<T> {
  try {
    // Use dynamic import for ESM modules
    if (typeof window === 'undefined' && typeof process !== 'undefined') {
      return await import(modulePath);
    }
    throw new Error('Dynamic import not supported in this environment');
  } catch (error) {
    // Fallback for CommonJS or when ESM import fails
    const module = await require(modulePath);
    return module as T;
  }
}

/**
 * Import a JSON file dynamically
 */
export async function importJson<T = unknown>(jsonPath: string): Promise<T> {
  const content = await dynamicImport<{ default: T }>(jsonPath);
  return content.default || content;
}

/**
 * Load and execute a script file
 */
export async function loadScript(scriptPath: string): Promise<void> {
  const module = await dynamicImport(scriptPath);
  
  if (module.default && typeof module.default === 'function') {
    await module.default();
  } else if (typeof module === 'function') {
    await module();
  }
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    if (typeof require !== 'undefined') {
      require('fs').accessSync(filePath);
      return true;
    }
  } catch {
    // File doesn't exist or can't be accessed
  }
  return false;
}
