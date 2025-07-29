// Centralized Logger Utility
// /Users/matthewsimon/Projects/eac/eac/lib/logger.ts

import { useHistoryStore } from '@/store/history';
import type { HistoryEntry } from '@/store/history/types';

export class Logger {
  private static getInstance() {
    return useHistoryStore.getState();
  }

  static success(
    category: HistoryEntry['category'], 
    action: string, 
    message: string, 
    details?: Record<string, unknown>
  ) {
    Logger.getInstance().addEntry({
      type: 'success',
      category,
      action,
      message,
      details,
    });
  }

  static error(
    category: HistoryEntry['category'], 
    action: string, 
    message: string, 
    details?: Record<string, unknown>
  ) {
    Logger.getInstance().addEntry({
      type: 'error',
      category,
      action,
      message,
      details,
    });
  }

  static warning(
    category: HistoryEntry['category'], 
    action: string, 
    message: string, 
    details?: Record<string, unknown>
  ) {
    Logger.getInstance().addEntry({
      type: 'warning',
      category,
      action,
      message,
      details,
    });
  }

  static info(
    category: HistoryEntry['category'], 
    action: string, 
    message: string, 
    details?: Record<string, unknown>
  ) {
    Logger.getInstance().addEntry({
      type: 'info',
      category,
      action,
      message,
      details,
    });
  }

  // Convenience methods for common operations
  static fileOpened(fileName: string, fileType: string) {
    Logger.info('file', 'file_opened', `Opened file: ${fileName}`, { fileName, fileType });
  }

  static fileStatusChanged(fileName: string, oldStatus: string, newStatus: string) {
    Logger.success('file', 'status_changed', `${fileName} status changed from ${oldStatus} to ${newStatus}`, {
      fileName,
      oldStatus,
      newStatus,
    });
  }

  static socialPostCreated(platform: string, title: string) {
    Logger.success('social', 'post_created', `Created ${platform} post: ${title}`, { platform, title });
  }

  static socialPostPublished(platform: string, title: string, postUrl?: string) {
    Logger.success('social', 'post_published', `Published ${platform} post: ${title}`, { 
      platform, 
      title, 
      postUrl 
    });
  }

  static socialPostFailed(platform: string, title: string, error: string) {
    Logger.error('social', 'post_failed', `Failed to publish ${platform} post: ${title}`, { 
      platform, 
      title, 
      error 
    });
  }

  static connectionEstablished(platform: string, username: string) {
    Logger.success('connection', 'connected', `Connected to ${platform} as ${username}`, { 
      platform, 
      username 
    });
  }

  static connectionFailed(platform: string, error: string) {
    Logger.error('connection', 'connection_failed', `Failed to connect to ${platform}`, { 
      platform, 
      error 
    });
  }

  static projectCreated(projectName: string) {
    Logger.success('project', 'project_created', `Created project: ${projectName}`, { projectName });
  }

  static folderToggled(folderName: string, isExpanded: boolean) {
    Logger.info('file', 'folder_toggled', `${isExpanded ? 'Expanded' : 'Collapsed'} folder: ${folderName}`, {
      folderName,
      isExpanded,
    });
  }

  static debugTest(testName: string, success: boolean, details?: Record<string, unknown>) {
    if (success) {
      Logger.success('debug', 'test_passed', `Debug test passed: ${testName}`, details);
    } else {
      Logger.error('debug', 'test_failed', `Debug test failed: ${testName}`, details);
    }
  }

  static systemEvent(action: string, message: string, details?: Record<string, unknown>) {
    Logger.info('system', action, message, details);
  }
}

// Export a simpler interface for common usage
export const logger = {
  success: Logger.success,
  error: Logger.error,
  warning: Logger.warning,
  info: Logger.info,
  
  // File operations
  fileOpened: Logger.fileOpened,
  fileStatusChanged: Logger.fileStatusChanged,
  folderToggled: Logger.folderToggled,
  
  // Social media operations
  socialPostCreated: Logger.socialPostCreated,
  socialPostPublished: Logger.socialPostPublished,
  socialPostFailed: Logger.socialPostFailed,
  
  // Connection operations
  connectionEstablished: Logger.connectionEstablished,
  connectionFailed: Logger.connectionFailed,
  
  // Project operations
  projectCreated: Logger.projectCreated,
  
  // Debug operations
  debugTest: Logger.debugTest,
  
  // System operations
  systemEvent: Logger.systemEvent,
};
