// Cron Jobs for Automated Tasks
// convex/cron.ts

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run trash cleanup every day at 2 AM UTC
crons.daily(
  "cleanup-expired-trash",
  {
    hourUTC: 2, // 2 AM UTC
    minuteUTC: 0,
  },
  internal.trash.cleanupExpiredTrash
);

export default crons;
