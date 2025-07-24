// Test component to check what's in localStorage
import { useEffect, useState } from 'react';

export const StorageInspector = () => {
  const [storageData, setStorageData] = useState<any>(null);

  useEffect(() => {
    const checkStorage = () => {
      const editorStorage = localStorage.getItem('editor-storage');
      if (editorStorage) {
        try {
          const parsed = JSON.parse(editorStorage);
          setStorageData(parsed);
        } catch (e) {
          console.error('Failed to parse editor storage:', e);
        }
      }
    };

    checkStorage();
    // Check every 2 seconds to see changes
    const interval = setInterval(checkStorage, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!storageData) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300">
        <h3 className="font-bold">Storage Inspector</h3>
        <p>No editor-storage found in localStorage</p>
      </div>
    );
  }

  const state = storageData.state || {};
  const projectFiles = state.projectFiles || [];
  const financialFiles = state.financialFiles || [];
  const openTabs = state.openTabs || [];

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">Storage Inspector</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Project Files ({projectFiles.length})</h4>
        {projectFiles.map((file: any, index: number) => (
          <div key={index} className="ml-4 mb-2 p-2 bg-white rounded">
            <p><strong>Name:</strong> {file.name}</p>
            <p><strong>Type:</strong> {file.type}</p>
            <p><strong>Has Content:</strong> {file.content ? 'Yes' : 'No'}</p>
            <p><strong>Content Length:</strong> {file.content?.length || 0}</p>
            {file.content && (
              <p><strong>Content Preview:</strong> {file.content.substring(0, 100)}...</p>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Financial Files ({financialFiles.length})</h4>
        {financialFiles.map((file: any, index: number) => (
          <div key={index} className="ml-4 mb-2 p-2 bg-white rounded">
            <p><strong>Name:</strong> {file.name}</p>
            <p><strong>Type:</strong> {file.type}</p>
            <p><strong>Has Content:</strong> {file.content ? 'Yes' : 'No'}</p>
            <p><strong>Content Length:</strong> {file.content?.length || 0}</p>
            {file.content && (
              <p><strong>Content Preview:</strong> {file.content.substring(0, 100)}...</p>
            )}
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-semibold">Open Tabs ({openTabs.length})</h4>
        {openTabs.map((tab: any, index: number) => (
          <div key={index} className="ml-4 mb-2 p-2 bg-white rounded">
            <p><strong>Name:</strong> {tab.name}</p>
            <p><strong>Type:</strong> {tab.type}</p>
            <p><strong>Has Content:</strong> {tab.content ? 'Yes' : 'No'}</p>
            <p><strong>Content Length:</strong> {tab.content?.length || 0}</p>
            {tab.content && (
              <p><strong>Content Preview:</strong> {tab.content.substring(0, 100)}...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
