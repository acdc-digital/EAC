// Reddit Store Types
// /Users/matthewsimon/Projects/eac/eac/store/social/types.ts

export interface SocialConnection {
  _id: string;
  _creationTime: number;
  userId: string;
  platform: "facebook" | "instagram" | "twitter" | "reddit";
  username: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  userAgent?: string;
  apiKey?: string;
  apiSecret?: string;
  isActive: boolean;
  lastSync?: number;
  tokenExpiry?: number;
  createdAt: number;
  updatedAt: number;
}

export interface RedditPost {
  _id: string;
  _creationTime: number;
  userId: string;
  connectionId: string;
  fileId?: string;
  
  // Required Reddit API fields
  subreddit: string;
  title: string;
  kind: "self" | "link" | "image" | "video";
  
  // Content fields
  text?: string;
  url?: string;
  
  // Optional fields
  nsfw: boolean;
  spoiler: boolean;
  flairId?: string;
  flairText?: string;
  sendReplies: boolean;
  
  // Scheduling and status
  status: "draft" | "scheduled" | "publishing" | "published" | "failed";
  publishAt?: number;
  publishedAt?: number;
  publishedUrl?: string;
  redditId?: string;
  
  // Error handling
  error?: string;
  retryCount?: number;
  lastRetryAt?: number;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

export interface CreateRedditPostArgs {
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
  fileId?: string;
}

export interface UpdateRedditPostArgs {
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
}

export interface CreateSocialConnectionArgs {
  platform: "facebook" | "instagram" | "twitter" | "reddit";
  username: string;
  clientId?: string;
  clientSecret?: string;
  userAgent?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface RedditConnectionFormData {
  username: string;
  clientId: string;
  clientSecret: string;
  userAgent?: string;
}

export interface SocialStoreState {
  // Connections
  connections: SocialConnection[];
  redditConnection: SocialConnection | null;
  isLoadingConnections: boolean;
  
  // Reddit Posts
  redditPosts: RedditPost[];
  isLoadingPosts: boolean;
  
  // UI State
  selectedPost: RedditPost | null;
  isConnecting: boolean;
  isPosting: boolean;
  
  // Error state
  error: string | null;
  
  // Actions - Connection Management
  loadConnections: (userId: string) => Promise<void>;
  createConnection: (userId: string, data: CreateSocialConnectionArgs) => Promise<string>;
  disconnectAccount: (connectionId: string) => Promise<void>;
  testConnection: (connectionId: string) => Promise<boolean>;
  
  // Actions - Reddit Posts
  loadRedditPosts: (userId: string, status?: "draft" | "scheduled" | "published" | "failed") => Promise<void>;
  createRedditPost: (userId: string, data: CreateRedditPostArgs) => Promise<string>;
  updateRedditPost: (postId: string, updates: UpdateRedditPostArgs) => Promise<void>;
  deleteRedditPost: (postId: string) => Promise<void>;
  submitPost: (postId: string) => Promise<boolean>;
  schedulePost: (postId: string, publishAt: number) => Promise<void>;
  
  // Actions - UI State
  setSelectedPost: (post: RedditPost | null) => void;
  clearError: () => void;
  
  // Utility actions
  validateSubreddit: (subreddit: string) => Promise<boolean>;
  getPostsByStatus: (status: "draft" | "scheduled" | "published" | "failed") => RedditPost[];
  getPostsBySubreddit: (subreddit: string) => RedditPost[];
}
