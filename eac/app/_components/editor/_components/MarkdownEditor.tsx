'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Edit3, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
  content: string
  onChange?: (content: string) => void
  editable?: boolean
}

const MarkdownEditor = ({ content, onChange, editable = true }: MarkdownEditorProps) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [markdownContent, setMarkdownContent] = useState(content)

  // Update local state when content prop changes
  useEffect(() => {
    setMarkdownContent(content)
  }, [content])

  const handleContentChange = (newContent: string) => {
    setMarkdownContent(newContent)
    onChange?.(newContent)
  }

  const handleModeChange = (newMode: 'edit' | 'preview') => {
    setMode(newMode)
  }

  const renderPreview = () => {
    if (!markdownContent.trim()) {
      return (
        <div className="text-[#858585] p-4 italic">
          No content to preview. Start writing in the editor...
        </div>
      )
    }
    
    return (
      <div className="markdown-preview p-0 pl-4 pr-4 text-[#cccccc] text-sm leading-relaxed">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold text-[#569cd6] mb-4 pb-2 border-b border-[#2d2d2d]">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold text-[#569cd6] mb-3 pb-2 border-b border-[#2d2d2d]">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold text-[#569cd6] mb-2">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-bold text-[#569cd6] mb-2">{children}</h4>,
            h5: ({ children }) => <h5 className="text-sm font-bold text-[#569cd6] mb-2">{children}</h5>,
            h6: ({ children }) => <h6 className="text-xs font-bold text-[#569cd6] mb-2">{children}</h6>,
            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>,
            blockquote: ({ children }) => <blockquote className="border-l-4 border-[#569cd6] pl-4 mb-4 text-[#858585] italic">{children}</blockquote>,
            code: ({ children }) => <code className="bg-[#2d2d2d] text-[#ce9178] px-2 py-1 rounded text-sm font-mono">{children}</code>,
            pre: ({ children }) => (
              <pre className="bg-[#0e0e0e] border border-[#2d2d2d] rounded-md p-4 mb-4 overflow-x-auto">
                <code className="text-[#cccccc] font-mono text-sm">{children}</code>
              </pre>
            ),
            strong: ({ children }) => <strong className="font-bold text-[#dcdcaa]">{children}</strong>,
            em: ({ children }) => <em className="italic text-[#c586c0]">{children}</em>,
            hr: () => <hr className="border-t border-[#2d2d2d] my-6" />,
            a: ({ children, href }) => <a href={href} className="text-[#4ec9b0] underline hover:text-[#6fd3b0]">{children}</a>,
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-1 bg-[#1a1a1a] min-h-[20px]">
        <div className="flex items-center gap-0">
          <span className="text-xs text-[#858585]">Markdown Editor</span>
        </div>
        
        {editable && (
          <div className="flex items-center gap-1 mt-2">
            <Button
              size="sm"
              variant={mode === 'edit' ? 'default' : 'outline'}
              onClick={() => handleModeChange('edit')}
              className={cn(
                "h-6 px-3 text-xs flex items-center",
                mode === 'edit' 
                  ? "bg-[#007acc] text-white hover:bg-[#005a9e]" 
                  : "bg-transparent border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
              )}
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Edit
            </Button>
            
            <Button
              size="sm"
              variant={mode === 'preview' ? 'default' : 'outline'}
              onClick={() => handleModeChange('preview')}
              className={cn(
                "h-6 px-3 text-xs flex items-center",
                mode === 'preview' 
                  ? "bg-[#007acc] text-white hover:bg-[#005a9e]" 
                  : "bg-transparent border-[#454545] text-[#cccccc] hover:bg-[#2d2d2d]"
              )}
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        {mode === 'edit' ? (
          <textarea
            value={markdownContent}
            onChange={(e) => handleContentChange(e.target.value)}
            disabled={!editable}
            className="w-full h-full p-4 bg-transparent text-[#cccccc] font-mono text-sm leading-relaxed resize-none outline-none border-none"
            placeholder="Start writing your markdown content here...

# This is a heading
## This is a subheading

- Bullet point 1
- Bullet point 2

**Bold text** and *italic text*

```code
Code block
```

[Link text](https://example.com)"
            spellCheck={false}
          />
        ) : (
          <div className="h-full overflow-auto">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownEditor
