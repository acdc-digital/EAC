// Debug script to clear all user state for testing onboarding
// Run this in browser console to force new user state

console.log('🔄 Clearing all user state for onboarding testing...');

// Clear localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('eac_') || key.includes('onboarding')) {
    console.log('🗑️ Removing localStorage key:', key);
    localStorage.removeItem(key);
  }
});

// Clear sessionStorage  
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('eac_') || key.includes('onboarding')) {
    console.log('🗑️ Removing sessionStorage key:', key);
    sessionStorage.removeItem(key);
  }
});

// Clear zustand persist storage specifically
localStorage.removeItem('eac-onboarding-storage');
console.log('🗑️ Cleared onboarding store persistence');

console.log('✅ User state cleared. Refresh the page to test onboarding flow.');
console.log('💡 Expected flow: Sign-in → Welcome tab → Terminal → "Ready to get started? y/N"');

// Show current localStorage state
console.log('📋 Current localStorage keys:', Object.keys(localStorage));
