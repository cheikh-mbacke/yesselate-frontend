/**
 * Draggable Component
 * Composant pour rendre un élément draggable
 */

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export interface DraggableProps {
  children: React.ReactNode;
  onDragStart?: (event: MouseEvent | TouchEvent) => void;
  onDrag?: (event: MouseEvent | TouchEvent) => void;
  onDragEnd?: (event: MouseEvent | TouchEvent) => void;
  disabled?: boolean;
  className?: string;
  dragConstraints?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  axis?: 'x' | 'y' | 'both';
  style?: React.CSSProperties;
}

export function Draggable({
  children,
  onDragStart,
  onDrag,
  onDragEnd,
  disabled = false,
  className = '',
  dragConstraints,
  axis = 'both',
  style,
}: DraggableProps) {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleDragStart = useCallback(
    (event: any, info: any) => {
      if (disabled) return;
      setIsDragging(true);
      onDragStart?.(event);
    },
    [disabled, onDragStart]
  );

  const handleDrag = useCallback(
    (event: any, info: any) => {
      if (disabled) return;
      onDrag?.(event);
    },
    [disabled, onDrag]
  );

  const handleDragEnd = useCallback(
    (event: any, info: any) => {
      if (disabled) return;
      setIsDragging(false);
      onDragEnd?.(event);
    },
    [disabled, onDragEnd]
  );

  return (
    <motion.div
      drag={!disabled}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
        ...style,
      }}
      className={className}
      whileDrag={{ scale: 1.05, zIndex: 1000 }}
    >
      {children}
    </motion.div>
  );
}

