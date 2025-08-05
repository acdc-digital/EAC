// Script to clean up problematic chat message content that might cause JSON parsing errors
// Run this script to sanitize existing data in the database


export const cleanupChatMessages = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 Starting chat message content cleanup...");
    
    let updatedCount = 0;
    let errorCount = 0;
    
    try {
      // Get all chat messages
      const allMessages = await ctx.db.query("chatMessages").collect();
      console.log(`📊 Found ${allMessages.length} messages to check`);
      
      for (const message of allMessages) {
        try {
          if (message.content && typeof message.content === 'string') {
            // Check if content has problematic characters
            const hasProblematicChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message.content) ||
                                       /\\(?![\\"/bfnrt]|u[0-9a-fA-F]{4})/.test(message.content);
            
            if (hasProblematicChars) {
              // Clean the content
              const cleanedContent = message.content
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
                .replace(/\\(?![\\"/bfnrt]|u[0-9a-fA-F]{4})/g, '') // Remove invalid escape sequences
                .replace(/\s+/g, ' ') // Collapse multiple spaces
                .trim();
              
              // Update the message with cleaned content
              await ctx.db.patch(message._id, {
                content: cleanedContent
              });
              
              updatedCount++;
              console.log(`✅ Cleaned message ${message._id}`);
            }
          }
        } catch (messageError) {
          console.error(`❌ Error processing message ${message._id}:`, messageError);
          errorCount++;
        }
      }
      
      // Also clean up chat sessions
      const allSessions = await ctx.db.query("chatSessions").collect();
      console.log(`📊 Found ${allSessions.length} sessions to check`);
      
      for (const session of allSessions) {
        try {
          let needsUpdate = false;
          const updates = {};
          
          if (session.preview && typeof session.preview === 'string') {
            const hasProblematicChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(session.preview) ||
                                       /\\(?![\\"/bfnrt]|u[0-9a-fA-F]{4})/.test(session.preview);
            
            if (hasProblematicChars) {
              updates.preview = session.preview
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                .replace(/\\(?![\\"/bfnrt]|u[0-9a-fA-F]{4})/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              needsUpdate = true;
            }
          }
          
          if (session.title && typeof session.title === 'string') {
            const hasProblematicChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(session.title) ||
                                       /\\(?![\\"/bfnrt]|u[0-9a-fA-F]{4})/.test(session.title);
            
            if (hasProblematicChars) {
              updates.title = session.title
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                .replace(/\\(?![\\"/bfnrt]|u[0-9a-fA-F]{4})/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              needsUpdate = true;
            }
          }
          
          if (needsUpdate) {
            await ctx.db.patch(session._id, updates);
            updatedCount++;
            console.log(`✅ Cleaned session ${session._id}`);
          }
        } catch (sessionError) {
          console.error(`❌ Error processing session ${session._id}:`, sessionError);
          errorCount++;
        }
      }
      
      console.log(`🎉 Cleanup complete! Updated ${updatedCount} records, ${errorCount} errors`);
      
      return {
        success: true,
        messagesProcessed: allMessages.length,
        sessionsProcessed: allSessions.length,
        recordsUpdated: updatedCount,
        errors: errorCount
      };
      
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
      return {
        success: false,
        error: error.message,
        recordsUpdated: updatedCount,
        errors: errorCount
      };
    }
  }
});
