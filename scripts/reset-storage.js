/**
 * Browser Console Script to Clear EAC Dashboard Storage
 * 
 * Instructions:
 * 1. Open Chrome DevTools (F12)
 * 2. Go to Console tab
 * 3. Paste this entire script
 * 4. Press Enter to execute
 * 5. Refresh the page
 */

console.log('🧹 Clearing EAC Dashboard Storage...');

// Clear all localStorage items
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('eac-') || key.includes('editor-') || key.includes('project-') || key.includes('zustand'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  console.log(`🗑️ Removing: ${key}`);
  localStorage.removeItem(key);
});

// Clear sessionStorage
sessionStorage.clear();

// Clear any indexedDB if exists
if ('indexedDB' in window) {
  indexedDB.databases().then(dbs => {
    dbs.forEach(db => {
      console.log(`🗑️ Clearing IndexedDB: ${db.name}`);
      indexedDB.deleteDatabase(db.name);
    });
  });
}

console.log('✅ Storage cleared! Please refresh the page.');
console.log('💡 This will reset all editor folders and remove duplicate key issues.');
