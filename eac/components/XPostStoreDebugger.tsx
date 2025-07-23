// Debug X Post Store
// Quick test component to verify store functionality

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetXFormData, useSaveXFormData, useXPostStore, type XPostFormData } from "@/store/social/xPosts";
import { useState } from "react";

export function XPostStoreDebugger() {
  const [testFileName, setTestFileName] = useState('test-post.x');
  const [testText, setTestText] = useState('');
  const saveFormData = useSaveXFormData();
  const getFormData = useGetXFormData();
  const formDataCache = useXPostStore(state => state.formDataCache);

  const handleSave = () => {
    const formData: XPostFormData = {
      text: testText,
      replySettings: 'everyone',
      scheduledDate: '',
      scheduledTime: '',
      isThread: false,
      threadTweets: [testText],
      mediaFiles: [],
      hasPoll: false,
      pollOptions: ['', ''],
      pollDuration: '1440',
    };
    
    console.log('🧪 TEST: Saving form data:', { fileName: testFileName, formData });
    saveFormData(testFileName, formData);
  };

  const handleLoad = () => {
    console.log('🧪 TEST: Loading form data for:', testFileName);
    const saved = getFormData(testFileName);
    console.log('🧪 TEST: Loaded data:', saved);
    if (saved) {
      setTestText(saved.text);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-[#2d2d2d] border border-[#454545] rounded">
      <h3 className="text-[#cccccc] font-semibold">X Post Store Debugger</h3>
      
      <div className="space-y-2">
        <label className="text-[#cccccc] text-sm">File Name:</label>
        <Input
          value={testFileName}
          onChange={(e) => setTestFileName(e.target.value)}
          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-[#cccccc] text-sm">Test Text:</label>
        <Input
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Type something to test..."
          className="bg-[#1e1e1e] border-[#454545] text-[#cccccc]"
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleSave} className="bg-[#1d9bf0] hover:bg-[#1a8cd8]">
          Save Test Data
        </Button>
        <Button onClick={handleLoad} variant="outline" className="border-[#454545] text-[#cccccc]">
          Load Test Data
        </Button>
      </div>
      
      <div className="mt-4 p-3 bg-[#1e1e1e] rounded border border-[#454545]">
        <h4 className="text-[#cccccc] text-sm font-medium mb-2">Current Cache:</h4>
        <pre className="text-xs text-[#858585] overflow-auto">
          {JSON.stringify(formDataCache, null, 2)}
        </pre>
      </div>
    </div>
  );
}
