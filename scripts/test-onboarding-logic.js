// Simple test to verify the onboarding disabled logic
console.log('🧪 Testing Onboarding Agent Disabled State Logic');
console.log('='.repeat(50));

// Mock localStorage
const mockLocalStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  clear: function() {
    this.data = {};
  }
};

// Replicate the getOnboardingState logic from the agent
function getOnboardingState(localStorage) {
  const completionKeys = [
    'onboardingCompleted',
    'onboarding_completed', 
    'hasCompletedOnboarding'
  ];
  
  return completionKeys.some(key => {
    const value = localStorage.getItem(key);
    return value === 'true' || value === '1';
  });
}

// Test scenarios
console.log('\n📋 Test 1: No completion keys set');
mockLocalStorage.clear();
console.log('Should be enabled:', !getOnboardingState(mockLocalStorage));

console.log('\n📋 Test 2: onboardingCompleted = "true"');
mockLocalStorage.clear();
mockLocalStorage.setItem('onboardingCompleted', 'true');
console.log('Should be disabled:', getOnboardingState(mockLocalStorage));

console.log('\n📋 Test 3: onboarding_completed = "true"');
mockLocalStorage.clear();
mockLocalStorage.setItem('onboarding_completed', 'true');
console.log('Should be disabled:', getOnboardingState(mockLocalStorage));

console.log('\n📋 Test 4: hasCompletedOnboarding = "true"');
mockLocalStorage.clear();
mockLocalStorage.setItem('hasCompletedOnboarding', 'true');
console.log('Should be disabled:', getOnboardingState(mockLocalStorage));

console.log('\n📋 Test 5: All keys set');
mockLocalStorage.clear();
mockLocalStorage.setItem('onboardingCompleted', 'true');
mockLocalStorage.setItem('onboarding_completed', 'true'); 
mockLocalStorage.setItem('hasCompletedOnboarding', 'true');
console.log('Should be disabled:', getOnboardingState(mockLocalStorage));

console.log('\n✅ Onboarding disabled logic verification complete!');
