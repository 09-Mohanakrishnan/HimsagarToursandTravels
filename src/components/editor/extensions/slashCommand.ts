import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import SlashCommandList from './SlashCommandList';

export default Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
});

export const getSuggestionItems = (query: string) => {
  return [
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: 'Heading1',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: 'Heading2',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: 'Heading3',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'Text',
      description: 'Just start typing with plain text.',
      icon: 'Type',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bulleted list.',
      icon: 'List',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering.',
      icon: 'ListOrdered',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Checklist',
      description: 'Track tasks with a to-do list.',
      icon: 'CheckSquare',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      icon: 'Quote',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setBlockquote().run();
      },
    },
    {
      title: 'Code',
      description: 'Capture a code snippet.',
      icon: 'Code',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run();
      },
    },
    {
      title: 'Divider',
      description: 'Visually divide blocks.',
      icon: 'Minus',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: 'Image',
      description: 'Insert an image.',
      icon: 'Image',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).run();
        // Custom event to trigger media library
        document.dispatchEvent(new CustomEvent('editor-insert-image', { detail: { editor } }));
      },
    },
    {
      title: 'YouTube',
      description: 'Embed a YouTube video.',
      icon: 'Youtube',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).run();
        const url = window.prompt("YouTube URL:");
        if (url) {
          editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
      },
    },
    {
      title: 'Table',
      description: 'Insert a 3x3 table.',
      icon: 'Table',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
    },
    {
      title: 'Info Callout',
      description: 'Add an info box.',
      icon: 'Info',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCallout('info').run();
      },
    },
    {
      title: 'Warning Callout',
      description: 'Add a warning box.',
      icon: 'AlertTriangle',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCallout('warning').run();
      },
    },
    {
      title: 'Travel Tip',
      description: 'Add a travel tip.',
      icon: 'Lightbulb',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCallout('tip').run();
      },
    },
  ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
};

export const suggestionOptions = {
  items: ({ query }: { query: string }) => getSuggestionItems(query),
  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(SlashCommandList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);
        if (!props.clientRect) {
          return;
        }
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
