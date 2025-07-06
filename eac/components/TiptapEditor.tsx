'use client'

import { useEditor, EditorContent } from '@tiptap/react'
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
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
    onCreate: ({ editor }) => {
      // Focus the editor when created
      setTimeout(() => {
        editor.commands.focus()
      }, 100)
    },
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Handle click to focus
  const handleClick = () => {
    if (editor) {
      editor.commands.focus()
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