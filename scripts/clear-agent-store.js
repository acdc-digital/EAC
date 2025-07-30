// Clear Agent Store Cache Script
// Run this in browser console to clear the cached agent data

console.log('Clearing agent store cache...');

// Remove both possible persisted agent store data keys
localStorage.removeItem('agent-store');
localStorage.removeItem('agent-storage');

// Also check for any other agent-related keys
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.includes('agent')) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  console.log(`Removing key: ${key}`);
  localStorage.removeItem(key);
});

console.log('Agent store cache cleared!');

// Force page reload to reinitialize with fresh data
location.reload();
