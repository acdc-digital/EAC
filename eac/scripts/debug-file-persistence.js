// Test File Persistence - Run this in browser console to debug file issues
// Usage: Copy and paste this entire script into browser console

console.log('🔍 === FILE PERSISTENCE DEBUG TOOL ===');

// Function to check current store state
function checkStoreState() {
  console.log('\n📊 Current Store State:');
  
  if (typeof window.useEditorStore === 'undefined') {
    console.log('❌ useEditorStore not found on window object');
    console.log('💡 Try running: window.useEditorStore = useEditorStore (in React DevTools or app code)');
    return;
  }
  
  const state = window.useEditorStore.getState();
  console.log('📁 Project Files:', state.projectFiles.length);
  console.log('💰 Financial Files:', state.financialFiles.length);
  console.log('📂 Project Folders:', state.projectFolders.length);
  console.log('🗂️ Financial Folders:', state.financialFolders.length);
  console.log('🗑️ Trash Items:', state.trashItems.length);
  console.log('📄 Open Tabs:', state.openTabs.length);
  
  if (state.projectFiles.length > 0) {
    console.log('\n📁 Project Files Details:');
    state.projectFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} (ID: ${file.id}) - Type: ${file.type} - Convex ID: ${file.convexId || 'NONE'}`);
    });
  }
  
  return state;
}

// Function to check localStorage
function checkLocalStorage() {
  console.log('\n💾 Local Storage Check:');
  
  try {
    const stored = localStorage.getItem('editor-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ Found localStorage data');
      console.log('📊 Version:', parsed.version);
      console.log('📁 Stored Project Files:', parsed.state?.projectFiles?.length || 0);
      console.log('💰 Stored Financial Files:', parsed.state?.financialFiles?.length || 0);
      console.log('📂 Stored Project Folders:', parsed.state?.projectFolders?.length || 0);
      console.log('📄 Stored Open Tabs:', parsed.state?.openTabs?.length || 0);
      
      if (parsed.state?.projectFiles?.length > 0) {
        console.log('\n📁 Stored Project Files:');
        parsed.state.projectFiles.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.name} (ID: ${file.id}) - Convex ID: ${file.convexId || 'NONE'}`);
        });
      }
    } else {
      console.log('❌ No localStorage data found');
    }
  } catch (error) {
    console.error('❌ Error reading localStorage:', error);
  }
}

// Function to test file creation
function testFileCreation() {
  console.log('\n🧪 Testing File Creation:');
  
  if (typeof window.useEditorStore === 'undefined') {
    console.log('❌ useEditorStore not available');
    return;
  }
  
  const store = window.useEditorStore.getState();
  const testFileName = `test-persistence-${Date.now()}`;
  
  console.log(`📝 Creating test file: ${testFileName}`);
  
  try {
    const fileId = store.createNewFile(testFileName, 'markdown', 'project');
    console.log(`✅ File created with ID: ${fileId}`);
    
    // Check if it was added to store
    setTimeout(() => {
      const newState = window.useEditorStore.getState();
      const createdFile = newState.projectFiles.find(f => f.id === fileId);
      if (createdFile) {
        console.log('✅ File found in store after creation');
        console.log('📄 File details:', {
          id: createdFile.id,
          name: createdFile.name,
          type: createdFile.type,
          convexId: createdFile.convexId || 'NONE',
          hasContent: !!createdFile.content,
          contentLength: createdFile.content?.length || 0
        });
      } else {
        console.log('❌ File not found in store after creation');
      }
      
      // Check localStorage
      setTimeout(() => {
        console.log('\n💾 Checking localStorage after file creation:');
        checkLocalStorage();
      }, 100);
    }, 100);
    
  } catch (error) {
    console.error('❌ Error creating test file:', error);
  }
}

// Function to clear storage (for testing)
function clearStorage() {
  console.log('\n🧹 Clearing Storage:');
  
  try {
    localStorage.removeItem('editor-storage');
    console.log('✅ localStorage cleared');
    
    if (typeof window.useEditorStore !== 'undefined') {
      window.useEditorStore.getState().reset();
      console.log('✅ Store reset');
    }
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
  }
}

// Main debug function
function debugFilePersistence() {
  checkStoreState();
  checkLocalStorage();
  
  console.log('\n🛠️ Available Commands:');
  console.log('• checkStoreState() - Check current Zustand store');
  console.log('• checkLocalStorage() - Check localStorage data');
  console.log('• testFileCreation() - Create a test file');
  console.log('• clearStorage() - Clear all storage (for testing)');
  console.log('• debugFilePersistence() - Run full debug');
}

// Make functions available globally
window.debugFilePersistence = debugFilePersistence;
window.checkStoreState = checkStoreState;
window.checkLocalStorage = checkLocalStorage;
window.testFileCreation = testFileCreation;
window.clearStorage = clearStorage;

// Run initial debug
debugFilePersistence();
