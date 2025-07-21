#!/usr/bin/env node

/**
 * EAC Dashboard Storage Reset Instructions
 * 
 * This script provides instructions to clear localStorage in your browser.
 * localStorage is only available in browsers, not Node.js.
 */

console.log('🧹 EAC Dashboard Storage Reset');
console.log('============================');
console.log();
console.log('❌ Error: localStorage is not available in Node.js');
console.log();
console.log('✅ To clear your dashboard storage, follow these steps:');
console.log();
console.log('1. Open http://localhost:3000 in your browser');
console.log('2. Press F12 to open Developer Tools');
console.log('3. Go to the Console tab');
console.log('4. Paste and run this command:');
console.log();
console.log('   localStorage.removeItem("editor-store");');
console.log('   localStorage.removeItem("sidebar-store");');  
console.log('   localStorage.clear();');
console.log('   location.reload();');
console.log();
console.log('This will:');
console.log('• Clear all stored projects and files');
console.log('• Reset the sidebar state');
console.log('• Reload the page with fresh state');
console.log('• Match your empty Convex database');
console.log();
console.log('💡 Alternatively, you can also open Application tab in DevTools,');
console.log('   click on Local Storage → localhost:3000, and delete all entries.');
console.log();
