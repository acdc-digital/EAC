// Test component to verify useSocialPost hook works without infinite loops
import { useSocialPost } from "@/lib/hooks/useSocialPost";

interface TestSocialPostProps {
  fileName: string;
}

export function TestSocialPost({ fileName }: TestSocialPostProps) {
  const {
    post,
    isLoading,
    status,
    saveContent,
  } = useSocialPost({ fileName, fileType: 'reddit' });

  const handleTestSave = () => {
    saveContent("Test content", "Test title");
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>Social Post Test: {fileName}</h3>
      <p>Status: {status}</p>
      <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Has Post: {post ? 'Yes' : 'No'}</p>
      <button 
        onClick={handleTestSave}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Save
      </button>
      {post && (
        <div className="mt-2">
          <p>Content: {post.content}</p>
          <p>Title: {post.title}</p>
        </div>
      )}
    </div>
  );
}
