// Test script to verify onboarding agent disabled state
// This simulates what happens in the browser

// Mock localStorage for testing
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

// Mock window object
global.window = {
  localStorage: mockLocalStorage
};

// Import the onboarding agent
const { onboardingAgent } = require('../eac/store/agents/onboardingAgent.ts');

console.log('🧪 Testing Onboarding Agent Disabled State Logic');
console.log('='.repeat(50));

// Test 1: No completion keys set
console.log('\n📋 Test 1: No completion keys set');
mockLocalStorage.clear();
const state1 = onboardingAgent.getDisabledState();
console.log('Disabled:', state1.disabled);
console.log('Reason:', state1.reason);

// Test 2: onboardingCompleted = 'true'
console.log('\n📋 Test 2: onboardingCompleted = "true"');
mockLocalStorage.clear();
mockLocalStorage.setItem('onboardingCompleted', 'true');
const state2 = onboardingAgent.getDisabledState();
console.log('Disabled:', state2.disabled);
console.log('Reason:', state2.reason);

// Test 3: onboarding_completed = 'true'
console.log('\n📋 Test 3: onboarding_completed = "true"');
mockLocalStorage.clear();
mockLocalStorage.setItem('onboarding_completed', 'true');
const state3 = onboardingAgent.getDisabledState();
console.log('Disabled:', state3.disabled);
console.log('Reason:', state3.reason);

// Test 4: hasCompletedOnboarding = 'true'
console.log('\n📋 Test 4: hasCompletedOnboarding = "true"');
mockLocalStorage.clear();
mockLocalStorage.setItem('hasCompletedOnboarding', 'true');
const state4 = onboardingAgent.getDisabledState();
console.log('Disabled:', state4.disabled);
console.log('Reason:', state4.reason);

// Test 5: Multiple keys set
console.log('\n📋 Test 5: Multiple completion keys set');
mockLocalStorage.clear();
mockLocalStorage.setItem('onboardingCompleted', 'true');
mockLocalStorage.setItem('onboarding_completed', 'true');
mockLocalStorage.setItem('hasCompletedOnboarding', 'true');
const state5 = onboardingAgent.getDisabledState();
console.log('Disabled:', state5.disabled);
console.log('Reason:', state5.reason);

console.log('\n✅ All tests completed!');
