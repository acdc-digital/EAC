// Authentication Debug Component
// Shows authentication status and user information for debugging

'use client';

import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { useConvexAuth } from 'convex/react';
import { Eye, EyeOff, Shield, User } from 'lucide-react';
import { useState } from 'react';

export function AuthDebugger() {
  const [showDetails, setShowDetails] = useState(false);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user, isLoaded } = useUser();

  const toggleDetails = () => setShowDetails(!showDetails);

  const getStatusBadge = () => {
    if (isLoading || !isLoaded) {
      return <span className="text-yellow-500">⏳ Loading...</span>;
    }
    if (isAuthenticated) {
      return <span className="text-green-500">✅ Authenticated</span>;
    }
    return <span className="text-red-500">❌ Not Authenticated</span>;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span className="text-xs font-medium">Auth Status:</span>
          {getStatusBadge()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDetails}
          className="h-6 px-2 text-xs"
        >
          {showDetails ? (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Hide
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Details
            </>
          )}
        </Button>
      </div>

      {showDetails && (
        <div className="bg-muted/30 rounded-md p-2 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Convex Auth:</span>
              <div className="font-mono text-xs">
                {isLoading ? "Loading..." : isAuthenticated ? "true" : "false"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Clerk Loaded:</span>
              <div className="font-mono text-xs">
                {isLoaded ? "true" : "false"}
              </div>
            </div>
          </div>

          {user && (
            <div className="border-t border-border pt-2">
              <div className="flex items-center gap-1 mb-1">
                <User className="w-3 h-3" />
                <span className="text-muted-foreground">User Info:</span>
              </div>
              <div className="space-y-1 pl-4">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs ml-1">{user.id}</span>
                </div>
                {user.firstName && (
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-1">{user.firstName} {user.lastName}</span>
                  </div>
                )}
                {user.emailAddresses?.[0] && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-1">{user.emailAddresses[0].emailAddress}</span>
                  </div>
                )}
                {user.username && (
                  <div>
                    <span className="text-muted-foreground">Username:</span>
                    <span className="ml-1">{user.username}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="border-t border-border pt-2">
              <div className="text-muted-foreground text-xs">
                💡 <strong>To authenticate:</strong>
                <br />
                1. Click the user icon in the activity bar
                <br />
                2. Select "Sign In" from the dropdown
                <br />
                3. Complete the sign-in process
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
