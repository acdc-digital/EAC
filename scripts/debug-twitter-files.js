// Script to debug Twitter files in the database

console.log("Starting Twitter files debug...");

// Check if we can access the database directly
async function debugTwitterFiles() {
  try {
    // We'll need to check files using the dev tools
    console.log("Please run this in the browser console to check Twitter files:");
    console.log(`
// In browser console, run:
fetch('/api/debug-files')
  .then(res => res.json())
  .then(data => {
    console.log('Twitter files in database:', data.filter(f => f.platform === 'twitter' || f.extension === 'x'));
  });
`);
  } catch (error) {
    console.error("Error accessing database:", error);
  }
}

debugTwitterFiles();
