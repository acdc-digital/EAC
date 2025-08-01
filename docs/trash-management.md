# Trash Management System

## Overview

The EAC Financial Dashboard implements a sophisticated trash management system that provides a seamless workflow for file and project deletion with proper safety measures and database synchronization.

## Workflow Design

### Two-Stage Deletion Process

1. **Initial Deletion (Explorer → Trash)**
   - **Action**: Click delete button in EAC explorer
   - **Behavior**: Item immediately moves to trash (no confirmation modal)
   - **Purpose**: Fast, friction-free deletion for improved user experience
   - **Location**: Items appear in trash panel for recovery

2. **Permanent Deletion (Trash → Gone)**
   - **Action**: Click delete button in trash panel
   - **Behavior**: Confirmation modal appears as safety measure
   - **Purpose**: Prevent accidental permanent deletion
   - **Result**: Item permanently removed from system

## Technical Implementation

### File Types Handled

The system distinguishes between two types of items:

1. **Database Items** (Convex-synced)
   - **Identification**: ID starts with 'k' (Convex ID format)
   - **Behavior**: Synced to database deletedFiles/deletedProjects tables
   - **Recovery**: Can be restored from database

2. **Local Items** (Editor-only)
   - **Identification**: Local UUID format
   - **Behavior**: Managed entirely in Zustand store
   - **Recovery**: Available until browser session ends

### Key Components

#### Editor Store (`store/editor/index.ts`)
- **`moveToTrash(id: string)`**: Moves items to trash with proper categorization
- **`permanentlyDelete(id: string)`**: Removes items permanently from local state
- **Database Integration**: Handles Convex sync for database items

#### Trash Component (`app/_components/dashboard/dashTrash.tsx`)
- **Restore Functionality**: Returns items to active state
- **Permanent Delete**: Two-step process with confirmation
- **Visual Feedback**: Loading states and proper styling

#### Sidebar Component (`app/_components/dashboard/dashSidebar.tsx`)
- **Quick Delete**: Streamlined deletion without confirmation
- **Context Menu**: Right-click delete option
- **Immediate Feedback**: Items disappear instantly

### Database Schema

#### Convex Tables
```typescript
// deletedFiles table
{
  originalId: string,
  name: string,
  type: string,
  content: string,
  deletedAt: number,
  userId?: string
}

// deletedProjects table  
{
  originalId: string,
  name: string,
  description?: string,
  status: string,
  budget?: number,
  deletedAt: number,
  userId?: string
}
```

## User Experience Features

### Streamlined Workflow
- **No Friction Deletions**: Explorer deletions happen immediately
- **Safety Net**: Trash provides recovery option
- **Confirmation Gate**: Modal prevents accidental permanent deletion

### Visual Feedback
- **Instant Removal**: Items disappear from explorer immediately
- **Trash Visibility**: Deleted items clearly shown in trash panel
- **Loading States**: Visual feedback during operations
- **Error Handling**: Graceful degradation on failures

### Keyboard Support
- **Delete Key**: Works in explorer for quick deletion
- **Context Menus**: Right-click delete options
- **Accessibility**: Proper ARIA labels and navigation

## Error Handling

### Database Failures
- **Graceful Degradation**: Local operations continue if database fails
- **Retry Logic**: Automatic retry for transient failures
- **User Feedback**: Clear error messages when operations fail

### Data Consistency
- **ID Validation**: Proper detection of database vs local items
- **Sync Recovery**: Handles database sync failures gracefully
- **State Integrity**: Maintains consistent state across operations

## Testing Workflow

### Test Case 1: Local File Deletion
1. Create test file (e.g., `deleteTest2.x`)
2. Delete from EAC explorer (no modal should appear)
3. Verify file moves to trash panel
4. Verify no entry in Convex `deletedFiles` table
5. Delete from trash (confirmation modal should appear)
6. Confirm deletion - file permanently removed

### Test Case 2: Database Project Deletion
1. Create project synced to database
2. Delete from explorer (immediate removal)
3. Verify entry appears in Convex `deletedProjects` table
4. Restore from trash (should sync back to database)
5. Delete again and permanently delete with confirmation

## Configuration

### Store Settings
```typescript
// Trash retention (can be configured)
const TRASH_RETENTION_DAYS = 30;

// Auto-cleanup (future enhancement)
const AUTO_CLEANUP_ENABLED = false;
```

### Convex Mutations
- **`deleteProject`**: Moves project to deletedProjects table
- **`deleteFile`**: Moves file to deletedFiles table
- **`restoreProject`**: Restores project from trash
- **`restoreFile`**: Restores file from trash
- **`permanentlyDeleteProject`**: Removes from deletedProjects
- **`permanentlyDeleteFile`**: Removes from deletedFiles

## Future Enhancements

### Planned Features
- **Auto-cleanup**: Automatic permanent deletion after retention period
- **Bulk Operations**: Select multiple items for batch operations
- **Trash Statistics**: Show trash usage and cleanup suggestions
- **Recovery History**: Track and display restoration activities

### Performance Optimizations
- **Lazy Loading**: Load trash contents on-demand
- **Pagination**: Handle large trash collections efficiently
- **Caching**: Smart caching for frequently accessed items

## Security Considerations

### Access Control
- **User Isolation**: Users can only access their own trash
- **Authentication**: Requires valid user session for database operations
- **Validation**: Proper input validation on all operations

### Data Protection
- **Soft Deletion**: Database items preserved in deleted tables
- **Audit Trail**: Track deletion and restoration activities
- **Privacy**: Secure handling of deleted content

## Maintenance

### Monitoring
- Monitor trash table sizes for cleanup needs
- Track deletion patterns for UX improvements
- Alert on database sync failures

### Cleanup Procedures
- Regular cleanup of old trash items
- Database maintenance for deleted tables
- Performance monitoring and optimization

---

*Last Updated: August 1, 2025*
*Version: 1.0*
*Status: Production Ready*
