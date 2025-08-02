// Trash Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashboard/dashTrash.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";
import { useTrash } from "@/lib/hooks/useTrash";
import { useEditorStore } from "@/store/editor";
import { TrashItem } from "@/store/editor/types";
import { ChevronDown, ChevronRight, FileText, Folder, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export function DashTrash() {
  const { trashItems: localTrashItems, restoreFromTrash: restoreFromLocalTrash, permanentlyDelete: localPermanentlyDelete, emptyTrash: emptyLocalTrash } = useEditorStore();
  const { trashItems: convexTrashItems, restoreFromTrash: restoreFromConvexTrash, permanentlyDelete: permanentlyDeleteFromConvex, isLoading } = useTrash();
  
  // Combine local and Convex trash items
  const allTrashItems = useMemo(() => {
    const combined = [...localTrashItems];
    
    // Add Convex items that aren't already in local trash
    convexTrashItems.forEach(convexItem => {
      const existsInLocal = localTrashItems.some(localItem => 
        localItem.originalData && 'convexId' in localItem.originalData && 
        localItem.originalData.convexId === convexItem.id
      );
      
      if (!existsInLocal) {
        combined.push(convexItem);
      }
    });
    
    return combined;
  }, [localTrashItems, convexTrashItems]);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; itemId: string; itemName: string; isConvexItem: boolean }>({
    isOpen: false,
    itemId: '',
    itemName: '',
    isConvexItem: false
  });
  const [emptyTrashConfirmation, setEmptyTrashConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null);

  const handlePermanentDeleteClick = (itemId: string, itemName: string) => {
    // Find the item to determine if it has a Convex ID
    const item = allTrashItems.find(item => item.id === itemId);
    const isConvexItem = !!(item?.originalData && 'convexId' in item.originalData && item.originalData.convexId);
    
    console.log('🔍 Determining item type:', {
      itemId,
      itemName,
      hasOriginalData: !!item?.originalData,
      hasConvexId: !!(item?.originalData && 'convexId' in item.originalData && item.originalData.convexId),
      convexId: item?.originalData && 'convexId' in item.originalData ? item.originalData.convexId : 'none',
      isConvexItem
    });
    
    setDeleteConfirmation({ isOpen: true, itemId, itemName, isConvexItem });
  };

  const handleConfirmPermanentDelete = async () => {
    if (deleteConfirmation.itemId) {
      try {
        console.log(`🗑️ Permanently deleting item:`, {
          itemId: deleteConfirmation.itemId,
          itemName: deleteConfirmation.itemName,
          isConvexItem: deleteConfirmation.isConvexItem
        });

        if (deleteConfirmation.isConvexItem) {
          // Get the actual Convex ID from the original data
          const item = allTrashItems.find(item => item.id === deleteConfirmation.itemId);
          const convexId = item?.originalData && 'convexId' in item.originalData ? item.originalData.convexId : null;
          
          if (!convexId) {
            console.error('❌ Cannot find Convex ID for item:', deleteConfirmation.itemId);
            return;
          }
          
          // Permanently delete from Convex using the actual Convex file ID
          console.log(`🔄 Calling Convex permanent delete for Convex ID: ${convexId}`);
          const result = await permanentlyDeleteFromConvex(convexId as Id<"files">);
          console.log(`✅ Convex permanent delete result:`, result);
          
          // Also remove from local trash since it was synced
          localPermanentlyDelete(deleteConfirmation.itemId);
          console.log(`✅ Also removed from local trash`);
        } else {
          // Delete from local trash
          console.log(`🔄 Calling local permanent delete for ID: ${deleteConfirmation.itemId}`);
          localPermanentlyDelete(deleteConfirmation.itemId);
          console.log(`✅ Local permanent delete completed`);
        }
        
        setDeleteConfirmation({ isOpen: false, itemId: '', itemName: '', isConvexItem: false });
        // Close drawer if the deleted item was selected
        if (selectedItem?.id === deleteConfirmation.itemId) {
          setSelectedItem(null);
        }
      } catch (error) {
        console.error("Error permanently deleting item:", error);
      }
    }
  };

  const handleEmptyTrashClick = () => {
    setEmptyTrashConfirmation(true);
  };

  const handleConfirmEmptyTrash = async () => {
    try {
      // Empty local trash
      emptyLocalTrash();
      
      // TODO: Add function to empty all Convex trash items
      // For now, we'll handle them individually
      console.log("Note: Convex items need to be deleted individually for now");
      
      setEmptyTrashConfirmation(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error emptying trash:", error);
    }
  };

  const handleRestoreClick = async (item: TrashItem) => {
    try {
      // Check if this is a Convex item
      const isConvexItem = convexTrashItems.some(convexItem => convexItem.id === item.id);
      
      if (isConvexItem) {
        // Restore from Convex
        await restoreFromConvexTrash(item.id as Id<"files">);
      } else {
        // Restore from local trash
        restoreFromLocalTrash(item.id);
      }
      
      setSelectedItem(null);
    } catch (error) {
      console.error("Error restoring item:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIcon = (item: TrashItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-3.5 h-3.5 text-[#c09553]" />;
    }
    return <FileText className="w-3.5 h-3.5 text-[#858585]" />;
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1 mb-2">
          <span>Trash</span>
          <span>{allTrashItems.length} {allTrashItems.length === 1 ? 'item' : 'items'}</span>
        </div>
        
        {/* Trash Management Section - Following debug console style */}
        {allTrashItems.length > 0 && (
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d] mb-2">
            <div className="p-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#858585]">Empty all items</span>
                <button
                  onClick={handleEmptyTrashClick}
                  className="text-xs text-[#ff6b6b] hover:text-[#ff5252] underline-offset-2 hover:underline"
                >
                  Empty
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {allTrashItems.length === 0 ? (
          <div className="flex flex-col items-center text-[#858585] px-6 pt-8">
            <Trash2 className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">Trash is empty</p>
            <p className="text-xs mt-1 text-center leading-relaxed">
              Deleted files and folders will appear here
            </p>
          </div>
        ) : (
          <div className="pt-1 space-y-1">
            {allTrashItems.map((item: TrashItem) => (
              <div key={item.id} className="mx-2">
                {/* Item Row - Following debug console styling */}
                <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
                  <div className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors">
                    <button
                      onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                      className="flex items-center gap-2 flex-1"
                    >
                      {selectedItem?.id === item.id ? 
                        <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                        <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                      }
                      {getIcon(item)}
                      <span className="text-xs font-medium flex-1 text-left text-[#cccccc] truncate">
                        {item.name}
                      </span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePermanentDeleteClick(item.id, item.name)}
                        className="p-1 hover:bg-[#3a3a3a] rounded transition-colors group"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3 h-3 text-[#858585] group-hover:text-[#ff6b6b] transition-colors" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {selectedItem?.id === item.id && selectedItem && (
                    <div className="px-2 pb-2 space-y-2">
                      {/* Separator like debug console */}
                      <div className="h-px bg-[#2d2d2d]" />
                      
                      {/* Details Section */}
                      <div className="text-[10px] text-[#858585] space-y-1">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="text-[#cccccc]">{selectedItem.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span className="text-[#cccccc]">{selectedItem.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deleted:</span>
                          <span className="text-[#cccccc]">{formatDate(selectedItem.deletedAt)}</span>
                        </div>
                        {selectedItem.originalData && 'filePath' in selectedItem.originalData && (
                          <div className="flex justify-between">
                            <span>Original Path:</span>
                            <span className="text-[#cccccc] truncate ml-2 max-w-[120px]" title={selectedItem.originalData.filePath}>
                              {selectedItem.originalData.filePath}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Separator */}
                      <div className="h-px bg-[#2d2d2d]" />
                      
                      {/* Action Buttons - Following debug console style */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs text-[#858585]">Restore from trash</span>
                          <button
                            onClick={() => handleRestoreClick(selectedItem)}
                            className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                          >
                            Restore
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs text-[#858585]">Delete permanently</span>
                          <button
                            onClick={() => handlePermanentDeleteClick(selectedItem.id, selectedItem.name)}
                            className="text-xs text-[#ff6b6b] hover:text-[#ff5252] underline-offset-2 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics - Following debug console style */}
      {allTrashItems.length > 0 && (
        <div className="mx-2 mb-2">
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d] p-2">
            <div className="text-[10px] text-[#858585] space-y-1">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="text-[#cccccc]">{allTrashItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Files:</span>
                <span className="text-[#cccccc]">{allTrashItems.filter(item => item.type === 'file').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Folders:</span>
                <span className="text-[#cccccc]">{allTrashItems.filter(item => item.type === 'folder').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmation({ isOpen: false, itemId: '', itemName: '', isConvexItem: false });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{deleteConfirmation.itemName}&rdquo;? This action cannot be undone and the item will be removed forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation({ isOpen: false, itemId: '', itemName: '', isConvexItem: false })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmPermanentDelete}
            >
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty Trash Confirmation Modal */}
      <Dialog open={emptyTrashConfirmation} onOpenChange={(open) => {
        if (!open) {
          setEmptyTrashConfirmation(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Empty Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete all {allTrashItems.length} items in the trash? This action cannot be undone and all items will be removed forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmptyTrashConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmEmptyTrash}
            >
              Empty Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
