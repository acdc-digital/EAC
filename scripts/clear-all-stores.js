#!/usr/bin/env node

/**
 * Clear All Zustand Store Data from Local Storage
 * 
 * This script clears all persisted Zustand store data from localStorage.
 * Run this when you need to reset all local state after clearing the database.
 * 
 * Usage: node scripts/clear-all-stores.js
 */

const storeKeys = [
  'editor-store',           // Editor/project folders and files
  'calendar-store',         // Calendar and scheduled posts
  'daily-tracker-store',    // Daily tracking data
  'sidebar-store',          // Sidebar state and preferences
  'materials-store',        // Materials and inventory
  'terminal-store',         // Terminal state (if persisted)
  'social-store',           // Social media store (if persisted)
];

console.log('🧹 Clearing all Zustand store data from localStorage...\n');

if (typeof localStorage === 'undefined') {
  console.log('❌ This script needs to run in a browser environment with localStorage');
  console.log('📋 Copy and paste this code into your browser console instead:\n');
  
  const clearScript = `
// Clear all EAC Zustand stores
const storeKeys = ${JSON.stringify(storeKeys, null, 2)};
storeKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log('✅ Cleared:', key);
  } else {
    console.log('ℹ️  Not found:', key);
  }
});
console.log('\\n🎉 All stores cleared! Refresh the page to see clean state.');
`;

  console.log(clearScript);
  process.exit(0);
}

// If running in browser environment
storeKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
  } else {
    console.log(`ℹ️  Not found: ${key}`);
  }
});

console.log('\n🎉 All stores cleared! Refresh the page to see clean state.');
