/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as automations from "../automations.js";
import type * as cases from "../cases.js";
import type * as documents from "../documents.js";
import type * as leads from "../leads.js";
import type * as messages from "../messages.js";
import type * as payments from "../payments.js";
import type * as seed from "../seed.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  automations: typeof automations;
  cases: typeof cases;
  documents: typeof documents;
  leads: typeof leads;
  messages: typeof messages;
  payments: typeof payments;
  seed: typeof seed;
  tasks: typeof tasks;
  users: typeof users;
  workflows: typeof workflows;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
