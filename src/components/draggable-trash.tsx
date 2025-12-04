import { useDraggable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";

type DraggableProps = PropsWithChildren<{
  id: string;
}>;

export function Draggable({ children, id }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button
      className="cursor-grab active:cursor-grabbing"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </button>
  );
}
