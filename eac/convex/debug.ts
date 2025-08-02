import { query } from "./_generated/server";

// Simple test function to check database contents
export const debugTables = query({
  args: {},
  handler: async (ctx) => {
    // Count files in each table
    const filesCount = await ctx.db.query("files").collect();
    const deletedFilesCount = await ctx.db.query("deletedFiles").collect();
    
    // Get recent files with isDeleted flag
    const recentFiles = await ctx.db
      .query("files")
      .order("desc")
      .take(5);
      
    // Get recent deleted files
    const recentDeletedFiles = await ctx.db
      .query("deletedFiles")
      .order("desc")
      .take(5);
    
    return {
      filesTableCount: filesCount.length,
      deletedFilesTableCount: deletedFilesCount.length,
      recentFiles: recentFiles.map(f => ({
        id: f._id,
        name: f.name,
        isDeleted: f.isDeleted,
        createdAt: f.createdAt
      })),
      recentDeletedFiles: recentDeletedFiles.map(f => ({
        id: f._id,
        originalId: f.originalId,
        name: f.name,
        deletedAt: f.deletedAt
      }))
    };
  },
});
