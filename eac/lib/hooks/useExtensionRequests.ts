import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export function useExtensionRequests() {
  // Queries
  const allRequests = useQuery(api.extensionRequests.getAllExtensionRequests, {});
  const popularRequests = useQuery(api.extensionRequests.getPopularExtensionRequests, { limit: 10 });
  
  // Mutations
  const createRequest = useMutation(api.extensionRequests.createExtensionRequest);
  const upvoteRequest = useMutation(api.extensionRequests.upvoteExtensionRequest);
  const downvoteRequest = useMutation(api.extensionRequests.downvoteExtensionRequest);
  const updateStatus = useMutation(api.extensionRequests.updateExtensionRequestStatus);
  
  return {
    // Data
    allRequests: allRequests ?? [],
    popularRequests: popularRequests ?? [],
    isLoading: allRequests === undefined,
    
    // Actions
    createRequest,
    upvoteRequest,
    downvoteRequest,
    updateStatus,
  };
}
