// Manual onboarding completion utility
// Run this in the browser console to force onboarding completion

async function forceCompleteOnboarding() {
  console.log('🔧 Force completing onboarding...');
  
  // Set localStorage keys
  localStorage.setItem('onboardingCompleted', 'true');
  localStorage.setItem('onboarding_completed', 'true');
  localStorage.setItem('hasCompletedOnboarding', 'true');
  
  console.log('✅ localStorage keys set');
  
  // Trigger onboarding store update if available
  if (window.useOnboardingStore) {
    try {
      const store = window.useOnboardingStore.getState();
      store.completeOnboarding();
      console.log('✅ Triggered onboarding store completion');
    } catch (err) {
      console.log('⚠️ Could not access onboarding store:', err);
    }
  }
  
  // Trigger agent refresh if available
  if (window.useAgentStore) {
    try {
      const store = window.useAgentStore.getState();
      store.refreshAgents();
      console.log('✅ Triggered agent refresh');
    } catch (err) {
      console.log('⚠️ Could not access agent store:', err);
    }
  }
  
  console.log('🔄 Please refresh the page to see changes');
}

// Run it
forceCompleteOnboarding();
