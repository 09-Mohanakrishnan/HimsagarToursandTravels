import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon, Unlink } from 'lucide-react'
import { cn } from '../lib/utils'

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 bg-slate-50 rounded-t-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn("p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors", editor.isActive('bold') && 'bg-gray-200 text-brand-primary')}
        type="button"
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn("p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors", editor.isActive('italic') && 'bg-gray-200 text-brand-primary')}
        type="button"
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={cn("p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors", editor.isActive('underline') && 'bg-gray-200 text-brand-primary')}
        type="button"
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>
      
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn("p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors", editor.isActive('bulletList') && 'bg-gray-200 text-brand-primary')}
        type="button"
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn("p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors", editor.isActive('orderedList') && 'bg-gray-200 text-brand-primary')}
        type="button"
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <button
        onClick={setLink}
        className={cn("p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors", editor.isActive('link') && 'bg-gray-200 text-brand-primary')}
        type="button"
        title="Set Link"
      >
        <LinkIcon size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        className={cn("p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors")}
        type="button"
        title="Unset Link"
      >
        <Unlink size={16} />
      </button>
    </div>
  )
}

export default function RichTextEditor({ value, onChange, placeholder = "Write something..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 text-gray-800',
      },
    },
  })

  // To update content when `value` prop changes externally (e.g. on load)
  // We check if editor is destroyed to prevent issues
  if (editor && editor.getHTML() !== value && value !== undefined) {
    if (value === '') {
      editor.commands.setContent('');
    } else if (value !== '<p></p>') {
      // Only set content if it's different from current to avoid cursor jump
      // and prevent '<p></p>' loop
      const currentHtml = editor.getHTML();
      if (currentHtml !== value && value) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-brand-primary transition-colors">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
