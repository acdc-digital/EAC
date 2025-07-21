// Trash Component
// /Users/matthewsimon/Projects/EAC/eac/app/_components/dashboard/dashTrash.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor";
import { TrashItem } from "@/store/editor/types";
import { FileText, Folder, RotateCcw, Trash2 } from "lucide-react";

export function DashTrash() {
  const { trashItems, restoreFromTrash, permanentlyDelete } = useEditorStore();

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
      return <Folder className="w-4 h-4 text-[#c09553]" />;
    }
    return <FileText className="w-4 h-4 text-[#858585]" />;
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Trash</span>
          <span>{trashItems.length} {trashItems.length === 1 ? 'item' : 'items'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {trashItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#858585] px-6">
            <Trash2 className="w-12 h-12 mb-4 opacity-50 mt-8" />
            <p className="text-sm">Trash is empty</p>
            <p className="text-xs mt-1 text-center leading-relaxed">
              Deleted files and folders will appear here
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {trashItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded hover:bg-[#2d2d2d] group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getIcon(item)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#cccccc] truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-[#858585] mt-1">
                      Deleted {formatDate(item.deletedAt)} • {item.category}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    onClick={() => restoreFromTrash(item.id)}
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 hover:bg-[#3d3d3d]"
                    title="Restore"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => permanentlyDelete(item.id)}
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 hover:bg-[#3d3d3d] text-red-400 hover:text-red-300"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      {trashItems.length > 0 && (
        <div className="border-t border-[#2d2d2d] p-3 text-xs text-[#858585]">
          <div className="flex justify-between">
            <span>
              Files: {trashItems.filter(item => item.type === 'file').length}
            </span>
            <span>
              Folders: {trashItems.filter(item => item.type === 'folder').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
