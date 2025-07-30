// Debug script to check localStorage for editor data
console.log('=== DEBUGGING EDITOR STORAGE ===');

// Check if there's editor storage
const editorStorage = localStorage.getItem('editor-storage');
if (editorStorage) {
  console.log('Editor storage found:');
  const parsed = JSON.parse(editorStorage);
  console.log(JSON.stringify(parsed, null, 2));
  
  if (parsed.state) {
    console.log('\n=== PROJECT FILES ===');
    console.log('Project files count:', parsed.state.projectFiles?.length || 0);
    parsed.state.projectFiles?.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        id: file.id,
        name: file.name,
        type: file.type,
        hasContent: !!file.content,
        contentLength: file.content?.length || 0,
        contentPreview: file.content?.substring(0, 100) || 'NO CONTENT'
      });
    });
    
    console.log('\n=== FINANCIAL FILES ===');
    console.log('Financial files count:', parsed.state.financialFiles?.length || 0);
    parsed.state.financialFiles?.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        id: file.id,
        name: file.name,
        type: file.type,
        hasContent: !!file.content,
        contentLength: file.content?.length || 0,
        contentPreview: file.content?.substring(0, 100) || 'NO CONTENT'
      });
    });
    
    console.log('\n=== OPEN TABS ===');
    console.log('Open tabs count:', parsed.state.openTabs?.length || 0);
    parsed.state.openTabs?.forEach((tab, index) => {
      console.log(`Tab ${index + 1}:`, {
        id: tab.id,
        name: tab.name,
        type: tab.type,
        hasContent: !!tab.content,
        contentLength: tab.content?.length || 0,
        contentPreview: tab.content?.substring(0, 100) || 'NO CONTENT'
      });
    });
  }
} else {
  console.log('No editor storage found in localStorage');
}

console.log('\n=== ALL STORAGE KEYS ===');
Object.keys(localStorage).forEach(key => {
  console.log(`${key}: ${localStorage.getItem(key)?.length || 0} characters`);
});
