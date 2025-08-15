// Test script to manually complete onboarding
// Run this in the browser console to test onboarding completion

console.log('🔧 Testing onboarding completion...');

// Set the localStorage keys
localStorage.setItem('onboardingCompleted', 'true');
localStorage.setItem('onboarding_completed', 'true');
localStorage.setItem('hasCompletedOnboarding', 'true');

console.log('✅ Set localStorage keys for onboarding completion');

// Check if they're set
console.log('📊 Current localStorage values:');
console.log('- onboardingCompleted:', localStorage.getItem('onboardingCompleted'));
console.log('- onboarding_completed:', localStorage.getItem('onboarding_completed'));
console.log('- hasCompletedOnboarding:', localStorage.getItem('hasCompletedOnboarding'));

// Trigger a page refresh to see the changes
console.log('🔄 Please refresh the page to see the onboarding agent disabled');
