import { QueryClient } from "@tanstack/react-query";

// Configure the QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetch on window focus to save resources
      retry: 1, // Retry failed queries once
      staleTime: 5 * 60 * 1000, // Cached data remains fresh for 5 minutes
      // cacheTime: 10 * 60 * 1000, // Unused cached data will be garbage-collected after 10 minutes
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff for retries
      // onError: (error) => {
      //   console.error("Query error:", error); // Log query errors for debugging
      // },
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error); // Log mutation errors for debugging
      },
    },
  },
});