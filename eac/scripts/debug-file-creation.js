// Debug script to test file creation persistence
// Run this in your browser's DevTools console

function debugFileCreation() {
  console.log('🔍 Debugging file creation persistence...');
  
  // Check current localStorage state
  const editorData = localStorage.getItem('editor-storage');
  if (editorData) {
    const parsed = JSON.parse(editorData);
    console.log('📊 Current storage state:', {
      projectFiles: parsed.state?.projectFiles?.length || 0,
      financialFiles: parsed.state?.financialFiles?.length || 0,
      projectFolders: parsed.state?.projectFolders?.length || 0,
      showProjectsCategory: parsed.state?.showProjectsCategory,
      showFinancialCategory: parsed.state?.showFinancialCategory
    });
    
    if (parsed.state?.projectFiles?.length > 0) {
      console.log('📁 Current project files:');
      parsed.state.projectFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (ID: ${file.id})`);
        console.log(`     Type: ${file.type}, Category: ${file.category}`);
        console.log(`     Has content: ${!!file.content} (${file.content?.length || 0} chars)`);
        console.log(`     Folder ID: ${file.folderId || 'No folder'}`);
        console.log(`     Created: ${file.createdAt}`);
      });
    }
  } else {
    console.log('❌ No editor-storage found in localStorage');
  }
  
  // Test creating a file manually
  console.log('\n🧪 Testing manual file creation...');
  
  // Get the store
  const store = window.__ZUSTAND_STORE__;
  if (store) {
    console.log('✅ Zustand store found');
    
    // Create a test file
    const testFileName = `test-debug-${Date.now()}`;
    console.log(`📝 Creating test file: ${testFileName}`);
    
    // Access the store state
    const state = store.getState();
    console.log('📊 Current store state:', {
      projectFiles: state.projectFiles?.length || 0,
      openTabs: state.openTabs?.length || 0
    });
    
    // Create a file
    if (state.createNewFile) {
      const fileId = state.createNewFile(testFileName, 'markdown', 'project');
      console.log(`✅ File created with ID: ${fileId}`);
      
      // Check if it was added
      const newState = store.getState();
      console.log('📊 Updated store state:', {
        projectFiles: newState.projectFiles?.length || 0,
        openTabs: newState.openTabs?.length || 0
      });
      
      // Check localStorage after creation
      setTimeout(() => {
        const updatedData = localStorage.getItem('editor-storage');
        if (updatedData) {
          const parsed = JSON.parse(updatedData);
          console.log('💾 Updated localStorage state:', {
            projectFiles: parsed.state?.projectFiles?.length || 0
          });
          
          const newFile = parsed.state?.projectFiles?.find(f => f.id === fileId);
          if (newFile) {
            console.log('✅ File found in localStorage:', newFile.name);
          } else {
            console.log('❌ File NOT found in localStorage');
          }
        }
      }, 100);
    } else {
      console.log('❌ createNewFile function not found in store');
    }
  } else {
    console.log('❌ Zustand store not found on window object');
    console.log('Available window properties:', Object.keys(window).filter(k => k.includes('ZUSTAND') || k.includes('store')));
  }
}

// Run the debug function
debugFileCreation();

// Also provide a way to clear storage if needed
window.clearEditorStorage = function() {
  localStorage.removeItem('editor-storage');
  console.log('🧹 Editor storage cleared');
  window.location.reload();
};

console.log('🔧 Debug functions loaded. Run debugFileCreation() to test, or clearEditorStorage() to reset.');
