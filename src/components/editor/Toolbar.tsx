import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote,
  Heading1, Heading2, Heading3, Heading4,
  Link as LinkIcon, Unlink, Image as ImageIcon, Video, FileText,
  Minus, Undo, Redo, Maximize, Minimize, AlertTriangle, Lightbulb
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToolbarProps {
  editor: Editor | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function Toolbar({ editor, isFullscreen, onToggleFullscreen }: ToolbarProps) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    document.dispatchEvent(new CustomEvent('editor-insert-image', { detail: { editor } }));
  };

  const addYoutube = () => {
    const url = window.prompt("YouTube URL:");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const Button = ({ icon: Icon, action, active = false, disabled = false, title }: any) => (
    <button
      onClick={action}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors flex items-center justify-center text-gray-600 hover:bg-gray-200",
        active && "bg-gray-200 text-brand-primary font-bold",
        disabled && "opacity-30 cursor-not-allowed"
      )}
      type="button"
    >
      <Icon size={16} />
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-gray-300 mx-1 shrink-0" />;

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 bg-slate-50/95 backdrop-blur rounded-t-xl shadow-sm">
      {/* History */}
      <Button icon={Undo} action={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)" />
      <Button icon={Redo} action={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)" />
      
      <Divider />

      {/* Headings */}
      <Button icon={Heading1} action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1" />
      <Button icon={Heading2} action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2" />
      <Button icon={Heading3} action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3" />
      
      <Divider />

      {/* Formatting */}
      <Button icon={Bold} action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)" />
      <Button icon={Italic} action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)" />
      <Button icon={Underline} action={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)" />
      <Button icon={Strikethrough} action={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough" />
      <Button icon={Highlighter} action={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight" />
      <Button icon={Code} action={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code" />

      <Divider />

      {/* Alignment */}
      <Button icon={AlignLeft} action={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left" />
      <Button icon={AlignCenter} action={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center" />
      <Button icon={AlignRight} action={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right" />
      <Button icon={AlignJustify} action={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify" />

      <Divider />

      {/* Lists */}
      <Button icon={List} action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List" />
      <Button icon={ListOrdered} action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List" />
      <Button icon={CheckSquare} action={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Checklist" />
      
      <Divider />

      {/* Blocks */}
      <Button icon={Quote} action={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote" />
      <Button icon={AlertTriangle} action={() => editor.chain().focus().setCallout('warning').run()} active={editor.isActive('callout')} title="Callout Box" />
      <Button icon={Minus} action={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Divider" />

      <Divider />

      {/* Insertions */}
      <Button icon={LinkIcon} action={setLink} active={editor.isActive('link')} title="Insert Link" />
      {editor.isActive('link') && (
        <Button icon={Unlink} action={() => editor.chain().focus().unsetLink().run()} title="Remove Link" />
      )}
      <Button icon={ImageIcon} action={addImage} title="Insert Image" />
      <Button icon={Video} action={addYoutube} title="Insert YouTube Video" />

      <div className="flex-1 min-w-[1rem]" />

      {/* Fullscreen */}
      <Button 
        icon={isFullscreen ? Minimize : Maximize} 
        action={onToggleFullscreen} 
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"} 
        active={isFullscreen} 
      />
    </div>
  );
}
