/**
 * Safe Convex helpers — always fall back to mock data when Convex returns
 * undefined (loading) or when the function doesn't exist yet.
 *
 * Usage:
 *   const leads = useConvexQuery(api.leads.listAll, {}, mockLeads);
 */
import { useQuery, useMutation } from "convex/react";

/**
 * Returns liveData when available, otherwise mockData.
 * Passes "skip" to useQuery when args is the string "skip".
 */
export function useConvexQuery(fn, args, mockData) {
  // useQuery must always be called (Rules of Hooks) — we pass "skip" to opt out
  const result = useQuery(fn, args === "skip" ? "skip" : args);
  return result ?? mockData;
}

/**
 * Thin wrapper so callers don't need to import from convex/react directly.
 */
export { useMutation };
