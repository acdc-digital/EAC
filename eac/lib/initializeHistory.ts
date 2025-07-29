// Initialize History Store
// /Users/matthewsimon/Projects/eac/eac/lib/initializeHistory.ts

import { logger } from './logger';

let initialized = false;

export function initializeHistory() {
  if (initialized) return;
  
  // Log system startup
  logger.systemEvent('system_initialized', 'EAC Dashboard initialized successfully', {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
  });
  
  initialized = true;
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Small delay to ensure stores are ready
  setTimeout(initializeHistory, 100);
}
