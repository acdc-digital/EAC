"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

export function useUserSync() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Sync user data to Convex when authenticated
      upsertUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        username: user.username || undefined,
        imageUrl: user.imageUrl || undefined,
      }).catch((error) => {
        console.error("Failed to sync user data:", error);
      });
    }
  }, [isAuthenticated, user, upsertUser]);

  return { isAuthenticated, user };
}
