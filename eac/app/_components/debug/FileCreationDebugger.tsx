"use client";

import { useEditorStore } from "@/store/editor";
import { useState } from "react";

export function FileCreationDebugger() {
  const { 
    createNewFile, 
    projectFiles, 
    financialFiles, 
    debugStorage 
  } = useEditorStore();
  
  const [testFileName, setTestFileName] = useState('');
  const [fileType, setFileType] = useState<'markdown' | 'reddit' | 'x' | 'facebook' | 'instagram'>('markdown');

  const handleCreateTestFile = () => {
    if (!testFileName.trim()) {
      alert('Please enter a file name');
      return;
    }
    
    console.log('🧪 Creating test file:', testFileName, 'Type:', fileType);
    const fileId = createNewFile(testFileName, fileType, 'project');
    console.log('✅ File created with ID:', fileId);
    
    // Debug storage after creation
    setTimeout(() => {
      debugStorage();
    }, 100);
    
    setTestFileName('');
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
      <h3 className="text-lg font-semibold mb-4">File Creation Debugger</h3>
      
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test File Name:</label>
          <input
            type="text"
            value={testFileName}
            onChange={(e) => setTestFileName(e.target.value)}
            placeholder="Enter test file name"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label htmlFor="file-type-select" className="block text-sm font-medium mb-1">File Type:</label>
          <select
            id="file-type-select"
            value={fileType}
            onChange={(e) => setFileType(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="markdown">Markdown</option>
            <option value="reddit">Reddit Post</option>
            <option value="x">X/Twitter Post</option>
            <option value="facebook">Facebook Post</option>
            <option value="instagram">Instagram Post</option>
          </select>
        </div>
        
        <button
          onClick={handleCreateTestFile}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Test File
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={debugStorage}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Debug Storage State
        </button>
        
        <button
          onClick={() => {
            localStorage.removeItem('editor-storage');
            window.location.reload();
          }}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Storage & Reload
        </button>
      </div>
      
      <div className="text-sm">
        <p><strong>Current Files:</strong></p>
        <p>Project Files: {projectFiles.length}</p>
        <p>Financial Files: {financialFiles.length}</p>
        
        {projectFiles.length > 0 && (
          <div className="mt-2">
            <p><strong>Recent Project Files:</strong></p>
            <ul className="list-disc list-inside">
              {projectFiles.slice(-3).map((file) => (
                <li key={file.id} className="text-xs">
                  {file.name} ({file.type})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
