// Reddit Integration Hook
// /Users/matthewsimon/Projects/eac/eac/lib/hooks/useRedditIntegration.ts

import { useMutation, useQuery } from 'convex/react';
import { useEffect } from 'react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useSocialStore } from '../../store/social';

export function useRedditIntegration(userId: string) {
  // Convex queries and mutations
  const connections = useQuery(api.reddit.getSocialConnections, { userId, platform: "reddit" });
  const redditPosts = useQuery(api.reddit.getRedditPosts, { userId });
  
  const createConnectionMutation = useMutation(api.reddit.createSocialConnection);
  const createPostMutation = useMutation(api.reddit.createRedditPost);
  const updatePostMutation = useMutation(api.reddit.updateRedditPost);
  const deletePostMutation = useMutation(api.reddit.deleteRedditPost);
  const disconnectMutation = useMutation(api.reddit.disconnectSocialAccount);
  
  // Zustand store actions
  const { 
    setConnections, 
    setRedditPosts, 
    setIsLoadingConnections,
    setIsLoadingPosts,
    setError,
    clearError
  } = useSocialStore(state => ({
    setConnections: (connections: any[]) => {
      const redditConnection = connections.find(c => c.platform === 'reddit');
      state.connections = connections;
      state.redditConnection = redditConnection || null;
    },
    setRedditPosts: (posts: any[]) => {
      state.redditPosts = posts;
    },
    setIsLoadingConnections: (loading: boolean) => {
      state.isLoadingConnections = loading;
    },
    setIsLoadingPosts: (loading: boolean) => {
      state.isLoadingPosts = loading;
    },
    setError: (error: string) => {
      state.error = error;
    },
    clearError: () => {
      state.error = null;
    },
  }));

  // Sync Convex data with Zustand store
  useEffect(() => {
    if (connections !== undefined) {
      setConnections(connections);
      setIsLoadingConnections(false);
    } else {
      setIsLoadingConnections(true);
    }
  }, [connections, setConnections, setIsLoadingConnections]);

  useEffect(() => {
    if (redditPosts !== undefined) {
      setRedditPosts(redditPosts);
      setIsLoadingPosts(false);
    } else {
      setIsLoadingPosts(true);
    }
  }, [redditPosts, setRedditPosts, setIsLoadingPosts]);

  // Enhanced actions that integrate with Convex
  const actions = {
    async createConnection(data: {
      username: string;
      clientId: string;
      clientSecret: string;
      userAgent?: string;
    }) {
      try {
        clearError();
        const connectionId = await createConnectionMutation({
          userId,
          platform: "reddit",
          username: data.username,
          clientId: data.clientId,
          clientSecret: data.clientSecret,
          userAgent: data.userAgent || `EACDashboard/1.0 by ${data.username}`,
        });
        return connectionId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create connection';
        setError(errorMessage);
        throw error;
      }
    },

    async disconnectAccount(connectionId: Id<"socialConnections">) {
      try {
        clearError();
        await disconnectMutation({ connectionId });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect account';
        setError(errorMessage);
        throw error;
      }
    },

    async createRedditPost(data: {
      subreddit: string;
      title: string;
      kind: "self" | "link" | "image" | "video";
      text?: string;
      url?: string;
      nsfw?: boolean;
      spoiler?: boolean;
      flairId?: string;
      flairText?: string;
      sendReplies?: boolean;
      publishAt?: number;
      fileId?: Id<"files">;
    }) {
      try {
        clearError();
        
        // Get the active Reddit connection
        const redditConnection = connections?.find(c => c.platform === 'reddit' && c.isActive);
        if (!redditConnection) {
          throw new Error('No active Reddit connection found. Please connect your Reddit account first.');
        }

        const postId = await createPostMutation({
          userId,
          connectionId: redditConnection._id,
          fileId: data.fileId,
          subreddit: data.subreddit.replace(/^r\//, ''), // Clean subreddit name
          title: data.title,
          kind: data.kind,
          text: data.text,
          url: data.url,
          nsfw: data.nsfw || false,
          spoiler: data.spoiler || false,
          flairId: data.flairId,
          flairText: data.flairText,
          sendReplies: data.sendReplies !== false, // Default to true
          publishAt: data.publishAt,
        });
        
        return postId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create Reddit post';
        setError(errorMessage);
        throw error;
      }
    },

    async updateRedditPost(postId: Id<"redditPosts">, updates: {
      subreddit?: string;
      title?: string;
      kind?: "self" | "link" | "image" | "video";
      text?: string;
      url?: string;
      nsfw?: boolean;
      spoiler?: boolean;
      flairId?: string;
      flairText?: string;
      sendReplies?: boolean;
      publishAt?: number;
      status?: "draft" | "scheduled" | "publishing" | "published" | "failed";
    }) {
      try {
        clearError();
        
        // Clean subreddit name if provided
        const cleanUpdates = { ...updates };
        if (cleanUpdates.subreddit) {
          cleanUpdates.subreddit = cleanUpdates.subreddit.replace(/^r\//, '');
        }
        
        await updatePostMutation({
          postId,
          ...cleanUpdates,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update Reddit post';
        setError(errorMessage);
        throw error;
      }
    },

    async deleteRedditPost(postId: Id<"redditPosts">) {
      try {
        clearError();
        await deletePostMutation({ postId });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete Reddit post';
        setError(errorMessage);
        throw error;
      }
    },

    // Utility functions
    validateSubreddit(subreddit: string): boolean {
      const clean = subreddit.replace(/^r\//, '');
      return clean.length > 0 && clean.length <= 21 && /^[A-Za-z0-9_]+$/.test(clean);
    },

    formatSubreddit(subreddit: string): string {
      return subreddit.startsWith('r/') ? subreddit : `r/${subreddit}`;
    },

    getActiveRedditConnection() {
      return connections?.find(c => c.platform === 'reddit' && c.isActive) || null;
    },
  };

  return {
    // Data
    connections: connections || [],
    redditPosts: redditPosts || [],
    
    // Loading states
    isLoadingConnections: connections === undefined,
    isLoadingPosts: redditPosts === undefined,
    
    // Enhanced actions
    ...actions,
  };
}
