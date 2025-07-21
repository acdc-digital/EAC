// Convex Cron Jobs
// convex/crons.ts

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Process scheduled Reddit posts every minute
crons.interval(
  "process scheduled reddit posts",
  { minutes: 1 },
  internal.redditApi.processScheduledRedditPosts
);

// Daily cleanup of trash items older than 30 days
crons.daily("Clean up expired trash", {
  hourUTC: 2, // 2:00 AM UTC
  minuteUTC: 0,
}, internal.trash.cleanupExpiredTrash);

export default crons;
