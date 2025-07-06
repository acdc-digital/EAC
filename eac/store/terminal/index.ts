// Terminal Store
// /Users/matthewsimon/Projects/EAC/eac/store/terminal/index.ts

import { create } from 'zustand';
import { TerminalState } from './types';
import { ImperativePanelHandle } from "react-resizable-panels";

export const useTerminalStore = create<TerminalState>((set, get) => ({
  isCollapsed: true,
  currentSize: 5,
  lastExpandedSize: 45,
  panelRef: null,
  isResizing: false,
  
  setCollapsed: (collapsed: boolean) => {
    const state = get();
    console.log('setCollapsed called:', { collapsed, currentLastExpandedSize: state.lastExpandedSize });
    set({ 
      isCollapsed: collapsed,
      currentSize: collapsed ? 5 : state.lastExpandedSize
    });
  },
  
  setSize: (size: number) => {
    const state = get();
    console.log('setSize called:', { size, isCollapsed: state.isCollapsed, currentLastExpandedSize: state.lastExpandedSize, isResizing: state.isResizing });
    
    // If we're in the middle of an imperative resize, ignore onResize callbacks for a short time
    if (state.isResizing) {
      console.log('Ignoring setSize during imperative resize operation');
      set({ currentSize: size });
      return;
    }
    
    // Don't update lastExpandedSize if we're getting a size that's close to minSize (20-25%)
    // when we have a much larger saved size - this indicates ResizablePanel interference during expand
    const isLikelyExpandInterference = !state.isCollapsed && 
                                      size <= 25 && 
                                      state.lastExpandedSize > 40;
    
    // Only update lastExpandedSize if:
    // 1. Not collapsed AND
    // 2. Size is reasonable (> 25% to avoid minSize interference) AND 
    // 3. Size is significantly different from current (> 3% difference) OR size is at maxSize (70%) AND
    // 4. Not likely to be expand interference
    const isSignificantChange = Math.abs(size - state.lastExpandedSize) > 3;
    const isMaxSize = size >= 70;
    const shouldUpdateLastExpandedSize = !state.isCollapsed && 
                                        size > 25 && 
                                        (isSignificantChange || isMaxSize) &&
                                        !isLikelyExpandInterference;
    
    const newLastExpandedSize = shouldUpdateLastExpandedSize ? size : state.lastExpandedSize;
    
    console.log('Setting new lastExpandedSize:', newLastExpandedSize, 'shouldUpdate:', shouldUpdateLastExpandedSize, 'isSignificantChange:', isSignificantChange, 'isMaxSize:', isMaxSize, 'isLikelyExpandInterference:', isLikelyExpandInterference);
    set({ 
      currentSize: size,
      lastExpandedSize: newLastExpandedSize
    });
  },
  
  setLastExpandedSize: (size: number) => {
    console.log('setLastExpandedSize called:', size);
    set({ lastExpandedSize: size });
  },
  
  setPanelRef: (ref: React.RefObject<ImperativePanelHandle | null>) => {
    console.log('setPanelRef called:', ref);
    set({ panelRef: ref });
  },
  
  toggleCollapse: () => {
    const state = get();
    const newCollapsed = !state.isCollapsed;
    const newSize = newCollapsed ? 5 : state.lastExpandedSize;
    console.log('toggleCollapse called:', { 
      currentCollapsed: state.isCollapsed, 
      newCollapsed, 
      lastExpandedSize: state.lastExpandedSize,
      newSize,
      panelRef: state.panelRef
    });
    
    // Set resizing flag to ignore onResize callbacks temporarily
    set({ isResizing: true });
    
    // Use imperative API to resize the panel
    if (state.panelRef?.current) {
      console.log('Resizing panel imperatively to:', newSize);
      state.panelRef.current.resize(newSize);
    }
    
    set({ 
      isCollapsed: newCollapsed,
      currentSize: newSize
    });
    
    // Clear the resizing flag after a short delay
    setTimeout(() => {
      set({ isResizing: false });
    }, 100);
  }
})); 