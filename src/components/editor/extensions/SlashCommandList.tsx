import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SlashCommandListProps {
  items: any[];
  command: (item: any) => void;
}

export default forwardRef(function SlashCommandList(props: SlashCommandListProps, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  if (props.items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden py-2 w-72 max-h-80 overflow-y-auto">
      {props.items.map((item, index) => {
        const IconComponent = (Icons as any)[item.icon] || Icons.FileText;
        return (
          <button
            key={index}
            className={cn(
              "w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors",
              index === selectedIndex ? "bg-slate-50 border-l-2 border-brand-primary" : "border-l-2 border-transparent"
            )}
            onClick={() => selectItem(index)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-100 text-gray-500 shrink-0 shadow-sm">
              <IconComponent size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{item.title}</p>
              <p className="text-[10px] text-gray-400 truncate">{item.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
});
