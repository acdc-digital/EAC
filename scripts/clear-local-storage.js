#!/usr/bin/env node

// Clear Local Storage Script
// This script helps clear persisted Zustand store data from localStorage

console.log('🧹 Local Storage Clearing Utility');
console.log('==================================');
console.log();
console.log('To clear your local editor state and sync with your empty database:');
console.log();
console.log('1. Open your browser developer tools (F12)');
console.log('2. Go to the Console tab');
console.log('3. Paste and run this command:');
console.log();
console.log('   localStorage.removeItem("editor-store");');
console.log('   localStorage.removeItem("sidebar-store");');
console.log('   location.reload();');
console.log();
console.log('This will:');
console.log('• Remove all locally stored projects and files');
console.log('• Clear the sidebar state');
console.log('• Reload the page with a fresh state');
console.log();
console.log('After running this command, your explorer will be empty,');
console.log('matching your empty Convex database.');
console.log();
console.log('Alternative: You can also run the reset-storage.js script:');
console.log('   node scripts/reset-storage.js');
