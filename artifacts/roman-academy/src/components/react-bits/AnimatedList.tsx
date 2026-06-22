import React, { useRef, useState, useEffect, useCallback, ReactNode, UIEvent } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-2 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps {
  items?: string[];
  onItemSelect?: (item: string, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  renderItem?: (item: string, index: number, isSelected: boolean) => React.ReactNode;
  maxHeight?: string;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  items = [],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  renderItem,
  maxHeight = '400px',
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  const handleItemMouseEnter = useCallback((index: number) => { setSelectedIndex(index); }, []);
  const handleItemClick = useCallback((item: string, index: number) => {
    setSelectedIndex(index);
    if (onItemSelect) onItemSelect(item, index);
  }, [onItemSelect]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault(); setKeyboardNav(true); setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault(); setKeyboardNav(true); setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault(); if (onItemSelect) onItemSelect(items[selectedIndex], selectedIndex);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (selectedItem) {
      const extraMargin = 50;
      const itemTop = selectedItem.offsetTop; const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < container.scrollTop + extraMargin) container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      else if (itemBottom > container.scrollTop + container.clientHeight - extraMargin)
        container.scrollTo({ top: itemBottom - container.clientHeight + extraMargin, behavior: 'smooth' });
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className={`overflow-y-auto p-2 ${displayScrollbar ? '[&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-navy-900 [&::-webkit-scrollbar-thumb]:bg-gold-500/30 [&::-webkit-scrollbar-thumb]:rounded-full' : 'scrollbar-hide'}`}
        onScroll={handleScroll}
        style={{ maxHeight, scrollbarWidth: displayScrollbar ? 'thin' : 'none', scrollbarColor: 'rgba(212,175,55,0.3) rgba(10,22,40,1)' }}
      >
        {items.map((item, index) => (
          <AnimatedItem key={index} delay={0.05} index={index}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            {renderItem ? renderItem(item, index, selectedIndex === index) : (
              <div className={`p-3 rounded-lg border transition-colors ${selectedIndex === index ? 'border-gold-400/40 bg-gold-400/10' : 'border-gold-400/10 bg-navy-900/50'} ${itemClassName}`}>
                <p className="text-white text-sm">{item}</p>
              </div>
            )}
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-navy-950 to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }} />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-navy-950 to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }} />
        </>
      )}
    </div>
  );
};

export default AnimatedList;
