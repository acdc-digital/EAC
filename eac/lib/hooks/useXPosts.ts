// @ts-nocheck
// Custom Convex hooks for X Posts
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useXPosts.ts

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { useXPostStore } from "../../store/social/xPosts";

export function useXPostsConvex(userId: string, connectionId?: Id<"socialConnections">) {
  const posts = useQuery(api.x.getXPosts, { 
    userId,
    connectionId 
  });
  
  const createXPost = useMutation(api.x.createXPost);
  const updateXPost = useMutation(api.x.updateXPost);
  const updateXPostStatus = useMutation(api.x.updateXPostStatus);

  return {
    posts: posts ?? [],
    isLoading: posts === undefined,
    createXPost,
    updateXPost,
    updateXPostStatus,
  };
}

export function useXPostByFileName(userId: string, fileName: string) {
  const post = useQuery(api.x.getXPostByFileName, { 
    userId, 
    fileName 
  });

  return {
    post,
    isLoading: post === undefined,
  };
}

// Integrated hook that bridges Convex with Zustand
export function useXPostIntegration(userId: string, fileName: string) {
  const { post: convexPost } = useXPostByFileName(userId, fileName);
  const { 
    saveFormData, 
    getFormData, 
    setCurrentPost,
    updatePost: updateZustandPost
  } = useXPostStore();
  
  const createXPost = useMutation(api.x.createXPost);
  const updateXPost = useMutation(api.x.updateXPost);

  // Sync Convex post to Zustand when loaded
  React.useEffect(() => {
    if (convexPost) {
      setCurrentPost(convexPost as any); // Type assertion for now - we'll fix schema types later
    }
  }, [convexPost, setCurrentPost]);

  return {
    convexPost,
    isLoading: convexPost === undefined && convexPost !== null,
    createXPost,
    updateXPost,
    saveFormData,
    getFormData,
    updateZustandPost,
  };
}
