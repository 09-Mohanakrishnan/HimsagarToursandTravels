import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { AlignLeft, AlignCenter, AlignRight, Maximize2, Trash2, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../lib/utils';

export default function ImageComponent(props: NodeViewProps) {
  const { src, alt, title, width, align } = props.node.attrs;
  const [isEditing, setIsEditing] = useState(false);
  const [altText, setAltText] = useState(alt || '');

  const setAlign = (alignment: string) => {
    props.updateAttributes({ align: alignment });
  };

  const removeImage = () => {
    props.deleteNode();
  };

  const toggleEdit = () => {
    if (isEditing) {
      props.updateAttributes({ alt: altText, title: altText });
    }
    setIsEditing(!isEditing);
  };

  let alignClass = 'mx-auto';
  if (align === 'left') alignClass = 'mr-auto ml-0';
  if (align === 'right') alignClass = 'ml-auto mr-0';

  return (
    <NodeViewWrapper className={cn("relative group my-8", alignClass)} style={{ width: width || '100%', maxWidth: '100%' }}>
      {/* Floating Toolbar */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
        <button onClick={() => setAlign('left')} className={cn("p-1.5 rounded hover:bg-gray-100", align === 'left' && "text-brand-primary")}><AlignLeft size={14} /></button>
        <button onClick={() => setAlign('center')} className={cn("p-1.5 rounded hover:bg-gray-100", align === 'center' && "text-brand-primary")}><AlignCenter size={14} /></button>
        <button onClick={() => setAlign('right')} className={cn("p-1.5 rounded hover:bg-gray-100", align === 'right' && "text-brand-primary")}><AlignRight size={14} /></button>
        <div className="w-px h-4 bg-gray-200 my-auto mx-1" />
        <button onClick={toggleEdit} className={cn("p-1.5 rounded hover:bg-gray-100", isEditing && "text-brand-primary")}><Edit3 size={14} /></button>
        <button onClick={removeImage} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
      </div>

      {isEditing && (
        <div className="absolute top-12 right-2 bg-white border border-gray-200 rounded-xl p-3 shadow-xl z-20 w-64">
          <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Alt Text (SEO)</label>
          <input 
            type="text" 
            value={altText} 
            onChange={e => setAltText(e.target.value)}
            onKeyDown={e => {
              // stop tiptap from capturing this event when typing in input
              e.stopPropagation();
            }}
            placeholder="Describe the image..."
            className="w-full bg-slate-50 border border-gray-100 rounded-lg py-2 px-3 text-sm outline-none focus:border-brand-primary mb-2"
          />
          <button onClick={toggleEdit} className="w-full py-2 bg-brand-primary text-white text-xs font-bold rounded-lg">Save Metadata</button>
        </div>
      )}

      <img 
        src={src} 
        alt={alt || ''} 
        title={title || ''}
        loading="lazy"
        className="w-full rounded-2xl object-cover" 
      />
      <figcaption className="mt-3 text-center text-sm text-gray-400 italic px-4">
        <NodeViewContent />
      </figcaption>
    </NodeViewWrapper>
  );
}
