'use client'

import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface TipTapEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

const colors = [
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#b7b7b7',
  '#cccccc',
  '#d9d9d9',
  '#efefef',
  '#f3f3f3',
  '#ffffff',
  '#980000',
  '#ff0000',
  '#ff9900',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#4a86e8',
  '#0000ff',
  '#9900ff',
  '#ff00ff',
  '#e6b8af',
  '#f4cccc',
  '#fce5cd',
  '#fff2cc',
  '#d9ead3',
  '#d0e0e3',
  '#c9daf8',
  '#cfe2f3',
  '#d9d2e9',
  '#ead1dc',
]

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter content...',
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update button position when color picker opens
  useEffect(() => {
    if (showColorPicker && colorButtonRef.current) {
      const rect = colorButtonRef.current.getBoundingClientRect()
      setButtonPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      })
    }
  }, [showColorPicker])

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  })

  // Sync editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const currentColor = editor?.getAttributes('textStyle').color || '#000000'

  if (!editor) {
    return null
  }

  const ColorPickerPortal = () => {
    if (!mounted || !showColorPicker) return null

    return createPortal(
      <>
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowColorPicker(false)}
        />
        <div
          className="fixed p-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 min-w-[220px]"
          style={{
            top: `${buttonPosition.top}px`,
            left: `${buttonPosition.left}px`,
          }}
        >
          <div className="grid grid-cols-10 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().setColor(color).run()
                  setShowColorPicker(false)
                }}
                className="w-5 h-5 rounded border border-slate-200 hover:scale-110 transition"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().unsetColor().run()
              setShowColorPicker(false)
            }}
            className="w-full mt-2 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200"
          >
            Reset Color
          </button>
        </div>
      </>,
      document.body,
    )
  }

  return (
    <div
      className={`border rounded-lg overflow-hidden transition flex flex-col ${
        isFocused || showColorPicker
          ? 'border-primary-500 ring-2 ring-primary-200'
          : 'border-slate-200'
      }`}
    >
      {/* Toolbar - Sticky */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 flex-shrink-0">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive('bold') ? 'bg-primary-100 text-primary-600' : ''
          }`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive('italic') ? 'bg-primary-100 text-primary-600' : ''
          }`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <div className="w-px bg-slate-300 h-6"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-primary-100 text-primary-600'
              : ''
          }`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-primary-100 text-primary-600'
              : ''
          }`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-primary-100 text-primary-600'
              : ''
          }`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive({ textAlign: 'justify' })
              ? 'bg-primary-100 text-primary-600'
              : ''
          }`}
          title="Align Justify"
        >
          <AlignJustify size={16} />
        </button>

        <div className="w-px bg-slate-300 h-6"></div>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-primary-100 text-primary-600'
              : ''
          }`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-primary-100 text-primary-600'
              : ''
          }`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-primary-100 text-primary-600'
              : ''
          }`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
        <div className="w-px bg-slate-300 h-6"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive('bulletList')
              ? 'bg-primary-100 text-primary-600'
              : ''
          }`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            editor.isActive('orderedList')
              ? 'bg-primary-100 text-primary-600'
              : ''
          }`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>

        {/* Text Color Picker */}
        <div className="w-px bg-slate-300 h-6"></div>
        <button
          ref={colorButtonRef}
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 rounded hover:bg-slate-200 transition flex items-center gap-1"
          title="Text Color"
        >
          <span className="text-xs font-bold">A</span>
          <div
            className="w-4 h-1 rounded"
            style={{ backgroundColor: currentColor }}
          ></div>
          <ChevronDown size={12} className="text-slate-500" />
        </button>
      </div>

      {/* Color Picker Portal */}
      <ColorPickerPortal />

      {/* Editor */}
      <div className="prose prose-sm max-w-none flex-1 overflow-auto">
        <EditorContent
          editor={editor}
          className="px-3 py-2 min-h-[150px] focus:outline-none text-sm max-h-[254px]"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
