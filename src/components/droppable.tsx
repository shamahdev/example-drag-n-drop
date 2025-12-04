import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";

type DroppableProps = PropsWithChildren<{
  id: string;
}>;

export function Droppable({ children, id }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
