/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity_logs from "../activity_logs.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as cars from "../cars.js";
import type * as customers from "../customers.js";
import type * as favorites from "../favorites.js";
import type * as files from "../files.js";
import type * as invoices from "../invoices.js";
import type * as notifications from "../notifications.js";
import type * as sales from "../sales.js";
import type * as seed from "../seed.js";
import type * as sendEmail from "../sendEmail.js";
import type * as siteSettings from "../siteSettings.js";
import type * as site_settings from "../site_settings.js";
import type * as statistics from "../statistics.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity_logs: typeof activity_logs;
  auth: typeof auth;
  bookings: typeof bookings;
  cars: typeof cars;
  customers: typeof customers;
  favorites: typeof favorites;
  files: typeof files;
  invoices: typeof invoices;
  notifications: typeof notifications;
  sales: typeof sales;
  seed: typeof seed;
  sendEmail: typeof sendEmail;
  siteSettings: typeof siteSettings;
  site_settings: typeof site_settings;
  statistics: typeof statistics;
  users: typeof users;
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
