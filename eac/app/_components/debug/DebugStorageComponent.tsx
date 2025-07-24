import { useEditorStore } from '@/store';
import { StorageInspector } from './StorageInspector';

export const DebugStorageComponent = () => {
  const { 
    projectFiles, 
    financialFiles, 
    openTabs, 
    activeTab,
    repairFilesWithoutContent
  } = useEditorStore();

  const handleDebugStorage = () => {
    console.log('=== EDITOR STORE DEBUG ===');
    
    console.log('Project Files:', projectFiles.length);
    projectFiles.forEach((file, index) => {
      console.log(`Project File ${index + 1}:`, {
        id: file.id,
        name: file.name,
        type: file.type,
        hasContent: !!file.content,
        contentLength: file.content?.length || 0,
        contentPreview: file.content?.substring(0, 50) || 'NO CONTENT'
      });
    });
    
    console.log('Financial Files:', financialFiles.length);
    financialFiles.forEach((file, index) => {
      console.log(`Financial File ${index + 1}:`, {
        id: file.id,
        name: file.name,
        type: file.type,
        hasContent: !!file.content,
        contentLength: file.content?.length || 0,
        contentPreview: file.content?.substring(0, 50) || 'NO CONTENT'
      });
    });
    
    console.log('Open Tabs:', openTabs.length);
    openTabs.forEach((tab, index) => {
      console.log(`Tab ${index + 1}:`, {
        id: tab.id,
        name: tab.name,
        type: tab.type,
        hasContent: !!tab.content,
        contentLength: tab.content?.length || 0,
        contentPreview: tab.content?.substring(0, 50) || 'NO CONTENT'
      });
    });
    
    console.log('Active Tab:', activeTab);
    
    // Check localStorage directly
    const storageData = localStorage.getItem('editor-storage');
    if (storageData) {
      const parsed = JSON.parse(storageData);
      console.log('=== LOCALSTORAGE RAW DATA ===');
      console.log('Storage State:', parsed.state);
    }
    
    // Try to debug the openTab function
    console.log('=== TESTING OPENTAB FUNCTION ===');
    if (projectFiles.length > 0) {
      const firstFile = projectFiles[0];
      console.log('First project file for testing:', {
        id: firstFile.id,
        name: firstFile.name,
        hasContent: !!firstFile.content,
        contentPreview: firstFile.content?.substring(0, 50) || 'NO CONTENT'
      });
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem('editor-storage');
    window.location.reload();
  };
  
  const handleCreateTestFiles = () => {
    const { createNewFile } = useEditorStore.getState();
    
    // Create a few test files with content
    createNewFile('Test Markdown', 'markdown', 'project');
    createNewFile('Test Reddit Post', 'reddit', 'project');
    createNewFile('Test TypeScript', 'typescript', 'project');
    
    console.log('Created test files');
  };
  
  const handleRepairFiles = () => {
    repairFilesWithoutContent();
    console.log('Repaired files without content');
  };

  return (
    <div className="p-4 border border-red-500 bg-red-50">
      <h3 className="text-lg font-bold text-red-700 mb-2">Debug Storage</h3>
      
      <div className="mb-4">
        <StorageInspector />
      </div>
      
      <div className="space-y-2">
        <button 
          onClick={handleDebugStorage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Debug Console Log
        </button>
        <button 
          onClick={handleClearStorage}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
        >
          Clear Storage & Reload
        </button>
        <button 
          onClick={handleCreateTestFiles}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
        >
          Create Test Files
        </button>
        <button 
          onClick={handleRepairFiles}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 ml-2"
        >
          Repair Files Without Content
        </button>
      </div>
      <div className="mt-4 text-sm">
        <p>Project Files: {projectFiles.length}</p>
        <p>Financial Files: {financialFiles.length}</p>
        <p>Open Tabs: {openTabs.length}</p>
        <p>Active Tab: {activeTab || 'none'}</p>
      </div>
    </div>
  );
};
