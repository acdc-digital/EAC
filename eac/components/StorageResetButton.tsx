import { Button } from "@/components/ui/button";

// Temporary Reset Component - Add this to your dashboard for easy storage clearing
export function StorageResetButton() {
  const handleReset = () => {
    if (typeof window === 'undefined') return;
    
    // First, let's see what's in localStorage
    console.log('🔍 Current localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`  - ${key}:`, localStorage.getItem(key)?.substring(0, 100) + '...');
      }
    }
    
    const confirmReset = window.confirm(
      'This will clear all your local projects and files to match the empty database. Continue?'
    );
    
    if (!confirmReset) return;
    
    try {
      console.log('🧹 Starting storage cleanup...');
      
      // Get all keys first (since removing items changes localStorage.length)
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allKeys.push(key);
      }
      
      // Clear ALL localStorage items (more thorough approach)
      allKeys.forEach(key => {
        console.log(`🗑️ Removing: ${key}`);
        localStorage.removeItem(key);
      });
      
      // Double-check specific Zustand stores
      localStorage.removeItem('editor-store');
      localStorage.removeItem('sidebar-store');
      
      // Clear session storage too
      sessionStorage.clear();
      
      console.log('✅ Storage cleared completely');
      
      // Small delay to ensure storage is cleared before reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Error clearing storage:', error);
      alert(`Error clearing storage: ${error instanceof Error ? error.message : String(error)}. Please use browser console method.`);
    }
  };
  
  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-md">
      <h3 className="text-red-800 font-medium mb-2">🧹 Storage Reset</h3>
      <p className="text-red-700 text-sm mb-3">
        Clear all local projects/files to match your empty database
      </p>
      <Button 
        onClick={handleReset}
        variant="destructive" 
        size="sm"
      >
        Clear Local Storage
      </Button>
    </div>
  );
}
