/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as cars from "../cars.js";
<<<<<<< HEAD
import type * as invoices from "../invoices.js";
import type * as sales from "../sales.js";
import type * as statistics from "../statistics.js";
=======
>>>>>>> d382507ea572d6a84bf6ab6305ac892fd0269226

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  cars: typeof cars;
<<<<<<< HEAD
  invoices: typeof invoices;
  sales: typeof sales;
  statistics: typeof statistics;
=======
>>>>>>> d382507ea572d6a84bf6ab6305ac892fd0269226
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
