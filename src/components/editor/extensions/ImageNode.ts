import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageComponent from './ImageComponent';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: any) => ReturnType;
    };
  }
}

export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  content: 'inline*', // for caption
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
      },
      align: {
        default: 'center', // left, center, right
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="resizable-image"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes({ 'data-type': 'resizable-image' }), 
      ['img', mergeAttributes(HTMLAttributes)],
      ['figcaption', 0]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
            content: [
              {
                type: 'text',
                text: 'Image caption...',
              },
            ],
          });
        },
    };
  },
});
