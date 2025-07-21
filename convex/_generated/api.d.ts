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
import type * as files from "../files.js";
import type * as messages from "../messages.js";
import type * as projects from "../projects.js";
import type * as projects_complex from "../projects_complex.js";
import type * as projects_simple from "../projects_simple.js";
import type * as test from "../test.js";

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
  files: typeof files;
  messages: typeof messages;
  projects: typeof projects;
  projects_complex: typeof projects_complex;
  projects_simple: typeof projects_simple;
  test: typeof test;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
