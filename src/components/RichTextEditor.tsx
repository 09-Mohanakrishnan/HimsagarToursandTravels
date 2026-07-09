import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Youtube from '@tiptap/extension-youtube';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

import { ResizableImage } from './editor/extensions/ImageNode';
import { CalloutNode } from './editor/extensions/CalloutNode';
import slashCommand, { suggestionOptions } from './editor/extensions/slashCommand';
import Toolbar from './editor/Toolbar';
import { cn } from '../lib/utils';
import { Clock, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAutoSave?: (content: string) => void;
}

export default function RichTextEditor({ value, onChange, placeholder = "Type '/' for commands...", onAutoSave }: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: 'bg-slate-900 text-slate-50 p-4 rounded-xl font-mono text-sm overflow-x-auto my-4' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-brand-primary pl-4 py-1 italic text-gray-700 bg-slate-50 my-4 rounded-r-xl' } }
      }),
      Underline,
      Highlight.configure({ HTMLAttributes: { class: 'bg-yellow-200 rounded px-1' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList.configure({ HTMLAttributes: { class: 'list-none pl-0' } }),
      TaskItem.configure({ nested: true, HTMLAttributes: { class: 'flex items-start gap-2 mb-1' } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'w-full border-collapse border border-gray-200 my-6' } }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: 'border border-gray-200 bg-slate-50 p-3 font-bold text-left' } }),
      TableCell.configure({ HTMLAttributes: { class: 'border border-gray-200 p-3' } }),
      Youtube.configure({ HTMLAttributes: { class: 'w-full aspect-video rounded-xl overflow-hidden my-6' } }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-brand-primary underline hover:text-brand-accent cursor-pointer' } }),
      Placeholder.configure({ placeholder, emptyEditorClass: 'is-editor-empty' }),
      ResizableImage,
      CalloutNode,
      slashCommand.configure({ suggestion: suggestionOptions }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
      setReadingTime(Math.max(1, Math.ceil(words / 200)));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none min-h-[500px] p-6 lg:p-10 text-gray-800 bg-white max-w-4xl',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value && value !== undefined) {
      if (value === '') {
        editor.commands.setContent('');
      } else if (value !== '<p></p>') {
        const currentHtml = editor.getHTML();
        if (currentHtml !== value && value) {
          editor.commands.setContent(value, { emitUpdate: false });
          // Initialize word count
          const text = editor.getText();
          const words = text.trim().split(/\s+/).filter(Boolean).length;
          setWordCount(words);
          setReadingTime(Math.max(1, Math.ceil(words / 200)));
        }
      }
    }
  }, [value, editor]);

  // Handle Fullscreen Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Image Upload Event Listener
  useEffect(() => {
    const handleInsertImage = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Show placeholder or loading state (omitted for brevity)
        const fd = new FormData();
        fd.append("file", file);
        const token = localStorage.getItem("adminToken");
        
        try {
          const res = await fetch("/api/admin/media/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          });
          const data = await res.json();
          if (data.url && editor) {
            editor.commands.setResizableImage({ src: data.url, alt: file.name });
          }
        } catch (err) {
          console.error("Failed to upload image", err);
          alert("Failed to upload image.");
        }
      };
      input.click();
    };

    document.addEventListener('editor-insert-image', handleInsertImage as EventListener);
    return () => document.removeEventListener('editor-insert-image', handleInsertImage as EventListener);
  }, [editor]);

  // Handle Drag & Drop / Paste for images
  useEffect(() => {
    if (!editor) return;
    const handlePaste = (view: any, event: ClipboardEvent, slice: any) => {
      const items = Array.from(event.clipboardData?.items || []);
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          event.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          
          const fd = new FormData();
          fd.append("file", file);
          const token = localStorage.getItem("adminToken");
          
          fetch("/api/admin/media/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          }).then(res => res.json()).then(data => {
            if (data.url) {
              const pos = view.state.selection.from;
              view.dispatch(view.state.tr.insert(pos, view.state.schema.nodes.resizableImage.create({ src: data.url })));
            }
          }).catch(console.error);
          return true;
        }
      }
      return false;
    };
    
    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        handlePaste,
      }
    });
  }, [editor]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "border border-gray-200 bg-gray-50/30 overflow-hidden flex flex-col transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-white" : "rounded-2xl shadow-sm focus-within:border-brand-primary"
      )}
    >
      <Toolbar 
        editor={editor} 
        isFullscreen={isFullscreen} 
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} 
      />
      
      <div className={cn("flex-1 overflow-y-auto relative", isFullscreen ? "h-screen" : "min-h-[500px]")}>
        <EditorContent editor={editor} className="h-full" />
      </div>

      <div className="bg-slate-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-[11px] text-gray-500 font-medium">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><Type size={12} /> {wordCount} words</span>
          <span className="flex items-center gap-1.5"><Clock size={12} /> {readingTime} min read</span>
        </div>
        <div>
          {editor && editor.can().undo() ? 'Unsaved changes' : 'All changes saved'}
        </div>
      </div>
      
      <style>{`
        .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
