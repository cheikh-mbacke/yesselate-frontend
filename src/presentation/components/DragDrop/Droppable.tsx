/**
 * Droppable Component
 * Composant pour créer une zone de drop
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DroppableProps {
  children: React.ReactNode;
  onDrop?: (data: any) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  accept?: string[];
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  style?: React.CSSProperties;
}

export function Droppable({
  children,
  onDrop,
  onDragEnter,
  onDragLeave,
  accept,
  disabled = false,
  className = '',
  activeClassName = 'border-blue-500 bg-blue-50',
  style,
}: DroppableProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragData, setDragData] = useState<any>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      const data = e.dataTransfer?.getData('application/json');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (!accept || accept.includes(parsed.type)) {
            setIsDragOver(true);
            setDragData(parsed);
            onDragEnter?.();
          }
        } catch {
          // Invalid JSON
        }
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (disabled) return;
      if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
        setDragData(null);
        onDragLeave?.();
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      const data = e.dataTransfer?.getData('application/json');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (!accept || accept.includes(parsed.type)) {
            onDrop?.(parsed);
          }
        } catch {
          // Invalid JSON
        }
      }

      setIsDragOver(false);
      setDragData(null);
    };

    const element = dropZoneRef.current;
    if (element) {
      element.addEventListener('dragover', handleDragOver);
      element.addEventListener('dragleave', handleDragLeave);
      element.addEventListener('drop', handleDrop);
    }

    return () => {
      if (element) {
        element.removeEventListener('dragover', handleDragOver);
        element.removeEventListener('dragleave', handleDragLeave);
        element.removeEventListener('drop', handleDrop);
      }
    };
  }, [disabled, accept, onDrop, onDragEnter, onDragLeave]);

  return (
    <div
      ref={dropZoneRef}
      className={`transition-all duration-200 ${isDragOver ? activeClassName : ''} ${className}`}
      style={style}
    >
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none"
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

