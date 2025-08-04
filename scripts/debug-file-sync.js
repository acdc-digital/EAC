#!/usr/bin/env node

/**
 * Debug script to check file sync between Convex and EAC Explorer
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging File Sync Issues');
console.log('================================');

// Check if localStorage has any project files
const localStoragePath = path.join(__dirname, '../debug-storage.js');
if (fs.existsSync(localStoragePath)) {
  console.log('📦 Found localStorage debug file');
  try {
    const content = fs.readFileSync(localStoragePath, 'utf8');
    console.log('📄 LocalStorage content preview:');
    console.log(content.substring(0, 500) + '...');
  } catch (error) {
    console.error('❌ Error reading localStorage debug:', error);
  }
} else {
  console.log('❌ No localStorage debug file found');
}

console.log('\n🔧 Recommended debugging steps:');
console.log('1. Open browser console and check for useFileLoad logs');
console.log('2. Look for "🔄 AGGRESSIVE SYNC" messages');
console.log('3. Check if Convex queries are returning data');
console.log('4. Verify user authentication is working');
console.log('5. Check if projectFiles array is being populated');

console.log('\n💡 Console commands to run in browser:');
console.log('// Check Zustand store state');
console.log('useEditorStore.getState().projectFiles');
console.log('');
console.log('// Check if user is authenticated');
console.log('// Look for Clerk user info');
console.log('');
console.log('// Check network tab for Convex API calls');
console.log('// Should see calls to getAllUserFiles and getProjects');
