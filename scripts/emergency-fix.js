// Emergency Fix for React Key Duplicates
// Run this in your browser console to fix the issue immediately

console.log('🚨 Emergency React Key Duplicate Fix');
console.log('====================================');

// Step 1: Clear all Zustand persisted storage
console.log('1. Clearing Zustand storage...');
Object.keys(localStorage).forEach(key => {
  if (key.includes('editor-store') || 
      key.includes('project-store') || 
      key.includes('eac-') ||
      key.includes('zustand')) {
    console.log(`   Removing: ${key}`);
    localStorage.removeItem(key);
  }
});

// Step 2: Clear session storage
console.log('2. Clearing session storage...');
sessionStorage.clear();

// Step 3: Force refresh React state by dispatching a custom event
console.log('3. Forcing React state refresh...');
window.dispatchEvent(new StorageEvent('storage', {
  key: 'editor-store',
  oldValue: null,
  newValue: null
}));

// Step 4: Show instructions
console.log('✅ Storage cleared!');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Refresh your browser page (Ctrl+R or Cmd+R)');
console.log('2. Check console - should be clean of React key errors');
console.log('3. The duplicate key "folder-index-1753064508939" should be gone');
console.log('');
console.log('🔧 If the error persists:');
console.log('1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
console.log('2. Open DevTools → Application → Storage → Clear All');
console.log('3. Restart your dev server');

// Automatic refresh after 2 seconds
setTimeout(() => {
  console.log('🔄 Auto-refreshing page...');
  window.location.reload();
}, 2000);
