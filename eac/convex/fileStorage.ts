import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate an upload URL for file uploads
 * This allows the frontend to upload files directly to Convex storage
 */
export const generateUploadUrl = mutation(async (ctx) => {
  // Check authentication
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  
  return await ctx.storage.generateUploadUrl();
});

/**
 * Store a file in Convex storage from base64 data
 * This is useful for API-generated content like DALL-E images
 */
export const storeFileFromBase64 = mutation({
  args: {
    base64Data: v.string(),
    contentType: v.string(),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Convert base64 to buffer  
    const buffer = Buffer.from(args.base64Data, 'base64');

    // Store the file using the correct Convex API
    const blob = new Blob([buffer]);
    const storageId = await ctx.storage.generateUploadUrl();
    
    // Upload the blob
    const uploadResponse = await fetch(storageId, {
      method: 'POST',
      body: blob,
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to storage');
    }
    
    const { storageId: finalStorageId } = await uploadResponse.json();
    return finalStorageId;
  },
});

/**
 * Get a file URL from storage
 */
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get file metadata
 */
export const getFileMetadata = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getMetadata(args.storageId);
  },
});

/**
 * Delete a file from storage
 */
export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.storage.delete(args.storageId);
  },
});
