/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as groceryItems from "../groceryItems.js";
import type * as householdMembers from "../householdMembers.js";
import type * as http from "../http.js";
import type * as notificationPreferences from "../notificationPreferences.js";
import type * as notifications from "../notifications.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as recipes from "../recipes.js";
import type * as stores from "../stores.js";
import type * as weekPlans from "../weekPlans.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  groceryItems: typeof groceryItems;
  householdMembers: typeof householdMembers;
  http: typeof http;
  notificationPreferences: typeof notificationPreferences;
  notifications: typeof notifications;
  pushSubscriptions: typeof pushSubscriptions;
  recipes: typeof recipes;
  stores: typeof stores;
  weekPlans: typeof weekPlans;
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
