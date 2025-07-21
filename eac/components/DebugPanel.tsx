// Debug Panel Component
// Quick access to development and debugging tools

import { ClearStorageButton } from '@/components/ClearStorageButton';
import { StorageDebugger } from '@/components/StorageDebugger';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, Database, Eye, Settings2 } from 'lucide-react';

export function DebugPanel() {
  return (
    <Card className="w-full max-w-md mx-4 mb-4 bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-orange-500" />
          <CardTitle className="text-sm">Debug Tools</CardTitle>
          <Badge variant="outline" className="text-xs">DEV</Badge>
        </div>
        <CardDescription className="text-xs">
          Development and debugging utilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Database className="w-4 h-4 mt-1 text-blue-500" />
          <div className="flex-1 space-y-2">
            <p className="text-xs text-muted-foreground">
              Clear all persisted store data (projects, calendar, etc.)
            </p>
            <ClearStorageButton />
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Eye className="w-4 h-4 mt-1 text-purple-500" />
          <div className="flex-1 space-y-2">
            <p className="text-xs text-muted-foreground">
              Inspect what&apos;s currently stored in localStorage
            </p>
            <StorageDebugger />
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Settings2 className="w-4 h-4 mt-1 text-green-500" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              Server: <span className="text-foreground">localhost:3001</span><br />
              Environment: <span className="text-foreground">development</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
