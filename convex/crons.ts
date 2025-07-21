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

export default crons;
