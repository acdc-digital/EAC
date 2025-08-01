// Test script to check if X disconnect is working
console.log('Testing X disconnect functionality...');

// Simulate the disconnect function call
const testDisconnect = async () => {
  console.log('🔌 Testing X disconnect...');
  
  // This should match what happens in the browser
  const mockTwitterConnection = {
    _id: 'test-connection-id',
    platform: 'twitter',
    username: 'testuser',
    twitterAccessToken: 'test-token'
  };
  
  console.log('Mock connection:', mockTwitterConnection);
  console.log('Connection has token:', !!mockTwitterConnection.twitterAccessToken);
  
  // Test the confirmation logic
  const confirmResult = true; // Simulate user clicking OK
  console.log('User confirmation:', confirmResult);
  
  if (confirmResult) {
    console.log('Would call deleteXConnection with ID:', mockTwitterConnection._id);
  }
};

testDisconnect();
