
import React, { useState, useRef } from 'react';
import { Stamp, StampStyle } from '../types';

interface StampItemProps {
  stamp: Stamp;
  isDraggable: boolean;
  onPositionChange: (id: string, x: number, y: number) => void;
  onClick: () => void;
}

const StampItem: React.FC<StampItemProps> = ({ stamp, isDraggable, onPositionChange, onClick }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const isImage = (symbol: string) => {
    return symbol.match(/\.(jpeg|jpg|gif|png|svg)$/) != null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isDraggable) return; // Locked stamps cannot be dragged
    e.stopPropagation();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: stamp.x,
      initialY: stamp.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current || !itemRef.current?.parentElement) return;

    const parentRect = itemRef.current.parentElement.getBoundingClientRect();
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const deltaXPercent = (deltaX / parentRect.width) * 100;
    const newX = Math.max(0, Math.min(100, dragRef.current.initialX + deltaXPercent));
    const newY = dragRef.current.initialY + deltaY;

    onPositionChange(stamp.locationId, newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) {
      // If not dragging, it might be a simple click
      return;
    }
    setIsDragging(false);
    
    dragRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleItemClick = (e: React.MouseEvent) => {
    // Only trigger detail view if we weren't just dragging
    if (!isDragging) {
      onClick();
    }
  };

  const getStyleClasses = (style: StampStyle) => {
    switch (style) {
      case 'Golden Record':
        return 'text-amber-600 drop-shadow-[0_6px_10px_rgba(217,119,6,0.3)]';
      case 'Jazz Lead Sheet':
        return 'text-blue-700 font-bold italic';
      default:
        return 'text-stone-800';
    }
  };

  return (
    <div
      ref={itemRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleItemClick}
      style={{
        position: 'absolute',
        left: `${stamp.x}%`,
        top: `50%`,
        transform: `translate(-50%, -50%) translateY(${stamp.y}px) rotate(${stamp.rotation || 0}deg) scale(${isDragging ? 1.6 : 1})`,
        touchAction: 'none',
        zIndex: isDragging ? 60 : 10,
      }}
      className={`${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} transition-transform duration-100 select-none ${getStyleClasses(stamp.style)}`}
    >
      {isImage(stamp.symbol) ? (
        <img 
          src={stamp.symbol} 
          alt="Musical Fragment" 
          className="w-16 h-16 object-contain pointer-events-none"
          onError={(e) => {
             (e.target as HTMLImageElement).src = 'https://api.iconify.design/material-symbols:music-note.svg';
          }}
        />
      ) : (
        <span className={`text-6xl leading-none ${stamp.style === 'Classical Manuscript' ? 'font-serif' : 'font-script'}`}>
          {stamp.symbol}
        </span>
      )}
      
      {isDragging && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-2 py-1 rounded-full uppercase tracking-widest whitespace-nowrap opacity-80 animate-bounce">
          Positioning
        </div>
      )}
    </div>
  );
};

export default StampItem;
