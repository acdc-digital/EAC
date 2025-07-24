// Test File Creator Component
import { useEditorStore } from '@/store';

export function TestFileCreator() {
  const createNewFile = useEditorStore(state => state.createNewFile);

  const createRedditTest = async () => {
    await createNewFile('test-reddit-post', 'reddit', 'project');
  };

  const createTwitterTest = async () => {
    await createNewFile('test-twitter-post', 'x', 'project');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg text-white text-sm z-50">
      <h3 className="font-bold mb-2">Test Social Posts</h3>
      <div className="flex gap-2">
        <button 
          onClick={createRedditTest}
          className="px-3 py-1 bg-orange-600 rounded hover:bg-orange-700"
        >
          Create Reddit Test
        </button>
        <button 
          onClick={createTwitterTest}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
        >
          Create Twitter Test
        </button>
      </div>
    </div>
  );
}
