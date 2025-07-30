"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

/**
 * Component that automatically creates a user in Convex database
 * when they first authenticate with Clerk
 */
export function UserInitializer() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeUser = async () => {
      if (
        isLoaded && 
        user && 
        !hasInitialized.current
      ) {
        try {
          hasInitialized.current = true;
          
          await upsertUser({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            username: user.username || undefined,
            imageUrl: user.imageUrl || undefined,
          });
          
          console.log("User initialized successfully in Convex database");
        } catch (error) {
          console.error("Failed to initialize user:", error);
          hasInitialized.current = false; // Allow retry
        }
      }
    };

    initializeUser();
  }, [isLoaded, user, upsertUser]);

  // This component doesn't render anything
  return null;
}
