import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function CalloutComponent(props: NodeViewProps) {
  const type = props.node.attrs.type as 'info' | 'warning' | 'success' | 'tip';

  let icon = <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />;
  let bgClass = "bg-blue-50 border-blue-200 text-blue-900";
  
  if (type === 'warning') {
    icon = <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />;
    bgClass = "bg-amber-50 border-amber-200 text-amber-900";
  } else if (type === 'success') {
    icon = <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />;
    bgClass = "bg-emerald-50 border-emerald-200 text-emerald-900";
  } else if (type === 'tip') {
    icon = <Lightbulb className="w-5 h-5 text-brand-primary mt-0.5 shrink-0" />;
    bgClass = "bg-[#fbf9f4] border-brand-primary/30 text-brand-dark";
  }

  return (
    <NodeViewWrapper className={cn("flex gap-3 p-4 rounded-xl border my-4", bgClass)}>
      <div contentEditable={false}>{icon}</div>
      <NodeViewContent className="flex-1 min-w-0" />
    </NodeViewWrapper>
  );
}
