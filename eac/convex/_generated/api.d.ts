/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activityLogs from "../activityLogs.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as chatActions from "../chatActions.js";
import type * as crons from "../crons.js";
import type * as eacConvexSchema from "../eacConvexSchema.js";
import type * as files from "../files.js";
import type * as messages from "../messages.js";
import type * as projects from "../projects.js";
import type * as projectsWorking from "../projectsWorking.js";
import type * as projects_complex from "../projects_complex.js";
import type * as projects_simple from "../projects_simple.js";
import type * as reddit from "../reddit.js";
import type * as redditApi from "../redditApi.js";
import type * as socialConnections from "../socialConnections.js";
import type * as socialPosts from "../socialPosts.js";
import type * as test from "../test.js";
import type * as testSimple from "../testSimple.js";
import type * as trash from "../trash.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as x from "../x.js";
import type * as xApi from "../xApi.js";
import type * as xApiActions from "../xApiActions.js";
import type * as xApi_clean from "../xApi_clean.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activityLogs: typeof activityLogs;
  auth: typeof auth;
  chat: typeof chat;
  chatActions: typeof chatActions;
  crons: typeof crons;
  eacConvexSchema: typeof eacConvexSchema;
  files: typeof files;
  messages: typeof messages;
  projects: typeof projects;
  projectsWorking: typeof projectsWorking;
  projects_complex: typeof projects_complex;
  projects_simple: typeof projects_simple;
  reddit: typeof reddit;
  redditApi: typeof redditApi;
  socialConnections: typeof socialConnections;
  socialPosts: typeof socialPosts;
  test: typeof test;
  testSimple: typeof testSimple;
  trash: typeof trash;
  users: typeof users;
  utils: typeof utils;
  x: typeof x;
  xApi: typeof xApi;
  xApiActions: typeof xApiActions;
  xApi_clean: typeof xApi_clean;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
