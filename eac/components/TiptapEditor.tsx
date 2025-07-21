'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import './tiptap-editor.css'

interface TiptapEditorProps {
  content: string
  onChange?: (content: string) => void
  editable?: boolean
}

const TiptapEditor = ({ content, onChange, editable = true }: TiptapEditorProps) => {
  console.log('TiptapEditor props:', { content: content?.slice(0, 50), editable, hasOnChange: !!onChange });

  const isPlaceholderText = (text: string) => {
    return text === 'Start writing your content here...' || text === '<p>Start writing your content here...</p>';
  };

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    immediatelyRender: false, // Prevent SSR issues
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-invert max-w-none',
        style: 'outline: none; border: none;',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange && editor?.view) {
        onChange(editor.getHTML())
      }
    },
    onCreate: ({ editor }) => {
      // Focus the editor when created
      if (editor?.view) {
        setTimeout(() => {
          editor.commands.focus()
        }, 100)
      }
    },
    onFocus: ({ editor }) => {
      // Clear placeholder text when user focuses
      if (editor?.view) {
        const currentContent = editor.getText().trim();
        if (isPlaceholderText(currentContent)) {
          editor.commands.clearContent();
        }
      }
    },
    onBlur: ({ editor }) => {
      // Show placeholder text when editor loses focus and content is empty
      if (editor?.view) {
        const currentContent = editor.getText().trim();
        if (currentContent === '') {
          editor.commands.setContent('<p>Start writing your content here...</p>');
        }
      }
    },
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && editor.view && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Handle click to focus
  const handleClick = () => {
    if (editor && editor.view) {
      editor.commands.focus()
      // Clear placeholder text when user clicks
      const currentContent = editor.getText().trim();
      if (isPlaceholderText(currentContent)) {
        editor.commands.clearContent();
      }
    }
  }

  if (!editor) {
    return <div className="text-[#858585]">Loading editor...</div>
  }

  return (
    <div onClick={handleClick} className="w-full h-full cursor-text">
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor 