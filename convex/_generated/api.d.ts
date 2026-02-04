/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

<<<<<<< HEAD
=======
import type * as cars from "../cars.js";

>>>>>>> 5771535218ce7fbed833afa9b4f8d65aa5f5d802
import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

<<<<<<< HEAD
declare const fullApi: ApiFromModules<{}>;
=======
declare const fullApi: ApiFromModules<{
  cars: typeof cars;
}>;
>>>>>>> 5771535218ce7fbed833afa9b4f8d65aa5f5d802

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
