import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Shared QueryClient with production-appropriate defaults.
// Individual hooks in api.ts set their own staleTime/refetchInterval.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default: treat data as fresh for 2 minutes — hooks override as needed
      staleTime: 2 * 60 * 1000,
      // Keep unused cache entries for 10 minutes before GC
      gcTime: 10 * 60 * 1000,
      // Don't retry on 4xx errors (bad request, not found, auth)
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes("4")) return false;
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
    },
  },
});

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Honor the staleTime set on each query — don't force-refetch on preload
    defaultPreloadStaleTime: 60_000,
  });

  return router;
};
