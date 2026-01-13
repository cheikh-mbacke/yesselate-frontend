/**
 * useDragAndDrop Hook
 * Hook pour gérer le drag & drop
 */

import { useState, useCallback, useRef } from 'react';

export interface DragItem {
  id: string;
  type: string;
  data: any;
}

export interface UseDragAndDropOptions {
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: (item: DragItem) => void;
  onDrop?: (item: DragItem, targetId: string) => void;
}

export function useDragAndDrop(options: UseDragAndDropOptions = {}) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const startDrag = useCallback(
    (item: DragItem, event: React.MouseEvent | React.TouchEvent) => {
      const clientX =
        'touches' in event
          ? event.touches[0].clientX
          : (event as React.MouseEvent).clientX;
      const clientY =
        'touches' in event
          ? event.touches[0].clientY
          : (event as React.MouseEvent).clientY;

      dragStartPos.current = { x: clientX, y: clientY };
      setDraggedItem(item);
      options.onDragStart?.(item);
    },
    [options]
  );

  const endDrag = useCallback(() => {
    if (draggedItem) {
      options.onDragEnd?.(draggedItem);
    }
    setDraggedItem(null);
    setDragOverTarget(null);
    dragStartPos.current = null;
  }, [draggedItem, options]);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (draggedItem) {
        options.onDrop?.(draggedItem, targetId);
      }
      endDrag();
    },
    [draggedItem, options, endDrag]
  );

  const setDragOver = useCallback((targetId: string | null) => {
    setDragOverTarget(targetId);
  }, []);

  return {
    draggedItem,
    dragOverTarget,
    isDragging: draggedItem !== null,
    startDrag,
    endDrag,
    handleDrop,
    setDragOver,
  };
}

