// Debug Storage Contents
// This component shows what's actually stored in localStorage

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import React from 'react';

export function StorageDebugger() {
  const [storageData, setStorageData] = React.useState<Record<string, unknown>>({});
  const [isVisible, setIsVisible] = React.useState(false);

  const inspectStorage = () => {
    const data: Record<string, unknown> = {};
    
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            // Try to parse JSON, fallback to raw string
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value;
            }
          }
        } catch (error) {
          data[key] = `Error reading: ${error}`;
        }
      }
    }
    
    setStorageData(data);
    setIsVisible(true);
    
    console.log('🔍 Current localStorage contents:', data);
  };

  return (
    <div className="space-y-2">
      <Button onClick={inspectStorage} variant="outline" size="sm">
        <Eye className="w-4 h-4 mr-2" />
        Inspect Storage
      </Button>
      
      {isVisible && (
        <Card className="w-full max-w-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Local Storage Contents</CardTitle>
            <CardDescription className="text-xs">
              Current data in localStorage
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
              {JSON.stringify(storageData, null, 2)}
            </pre>
            
            {Object.keys(storageData).length === 0 && (
              <p className="text-xs text-muted-foreground">
                ✅ localStorage is empty (good!)
              </p>
            )}
            
            <div className="mt-3 pt-3 border-t">
              <Button 
                onClick={() => setIsVisible(false)} 
                variant="ghost" 
                size="sm"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
