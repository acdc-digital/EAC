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
import type * as chat from "../chat.js";
import type * as chatActions from "../chatActions.js";
import type * as convex__generated_api from "../convex/_generated/api.js";
import type * as convex__generated_server from "../convex/_generated/server.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as messages from "../messages.js";
import type * as projects from "../projects.js";
import type * as projects_complex from "../projects_complex.js";
import type * as projects_simple from "../projects_simple.js";
import type * as reddit from "../reddit.js";
import type * as redditApi from "../redditApi.js";
import type * as test from "../test.js";
import type * as trash from "../trash.js";
import type * as x from "../x.js";
import type * as xApi from "../xApi.js";
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
  chat: typeof chat;
  chatActions: typeof chatActions;
  "convex/_generated/api": typeof convex__generated_api;
  "convex/_generated/server": typeof convex__generated_server;
  crons: typeof crons;
  files: typeof files;
  messages: typeof messages;
  projects: typeof projects;
  projects_complex: typeof projects_complex;
  projects_simple: typeof projects_simple;
  reddit: typeof reddit;
  redditApi: typeof redditApi;
  test: typeof test;
  trash: typeof trash;
  x: typeof x;
  xApi: typeof xApi;
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
