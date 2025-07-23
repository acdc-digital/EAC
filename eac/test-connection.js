// Simple test to check connection state
console.log('Testing connection state...');

// Force the browser to refresh the connection data
if (typeof window !== 'undefined') {
  console.log('Running in browser, clearing all caches...');
  
  // Clear localStorage
  if (window.localStorage) {
    console.log('Clearing localStorage...');
    window.localStorage.clear();
  }
  
  // Clear sessionStorage  
  if (window.sessionStorage) {
    console.log('Clearing sessionStorage...');
    window.sessionStorage.clear();
  }
  
  // Force reload
  console.log('Forcing page reload...');
  window.location.reload();
} else {
  console.log('Running in Node.js environment');
}
