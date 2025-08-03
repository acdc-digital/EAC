
if (typeof window !== 'undefined' && window.localStorage) {
  const editorData = localStorage.getItem('editor-storage');
  if (editorData) {
    const parsed = JSON.parse(editorData);
    console.log('📁 Current stored project files:', parsed.state?.projectFiles?.length || 0);
    console.log('💰 Current stored financial files:', parsed.state?.financialFiles?.length || 0);
    console.log('📂 Current stored project folders:', parsed.state?.projectFolders?.length || 0);
    
    if (parsed.state?.projectFiles?.length > 0) {
      console.log('🔍 Recent project files:');
      parsed.state.projectFiles.slice(-3).forEach(file => {
        console.log('  -', file.name, '(' + file.id + ')');
      });
    }
    
    if (parsed.state?.financialFiles?.length > 0) {
      console.log('🔍 Recent financial files:');
      parsed.state.financialFiles.slice(-3).forEach(file => {
        console.log('  -', file.name, '(' + file.id + ')');
      });
    }
  } else {
    console.log('❌ No editor-storage found in localStorage');
  }
} else {
  console.log('❌ localStorage not available');
}
