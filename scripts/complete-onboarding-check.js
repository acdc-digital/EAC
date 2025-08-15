// Run this in browser console to complete onboarding for users who already have brand guidelines

console.log('🔧 Checking if user should have onboarding completed...');

// Check if user has brand guidelines (indication they completed onboarding)
const hasInstructionsFiles = document.querySelector('[data-testid="file-item"]') || 
                             document.querySelector('.file-item') ||
                             window.location.href.includes('acdc_digital_brand_guidelines');

if (hasInstructionsFiles) {
  console.log('🎯 User has brand guidelines - completing onboarding');
  
  // Set localStorage keys
  localStorage.setItem('onboardingCompleted', 'true');
  localStorage.setItem('onboarding_completed', 'true');
  localStorage.setItem('hasCompletedOnboarding', 'true');
  
  console.log('✅ Onboarding completion keys set');
  
  // Also update the Zustand onboarding store if available
  try {
    // This will work if the stores are available on window (in dev mode)
    const onboardingState = JSON.parse(localStorage.getItem('eac-onboarding-storage') || '{}');
    onboardingState.state = {
      ...onboardingState.state,
      isOnboardingComplete: true,
      isOnboardingActive: false,
      currentStep: 'complete'
    };
    localStorage.setItem('eac-onboarding-storage', JSON.stringify(onboardingState));
    console.log('✅ Updated Zustand onboarding storage');
  } catch (err) {
    console.log('⚠️ Could not update Zustand storage:', err);
  }
  
  console.log('🔄 Please refresh the page to see the onboarding agent disabled');
} else {
  console.log('ℹ️ No brand guidelines found - onboarding may still be needed');
}
