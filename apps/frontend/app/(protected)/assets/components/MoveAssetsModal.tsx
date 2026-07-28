'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FolderOpen, Home, ChevronRight, Copy, FolderInput, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  FolderTreeNode,
  assetsService,
} from '@/lib/services/assets.service';
import { cn } from '@/lib/utils';

interface MoveAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  mode: 'move' | 'copy';
  onSuccess: () => void;
}

export function MoveAssetsModal({
  isOpen,
  onClose,
  selectedIds,
  mode,
  onSuccess,
}: MoveAssetsModalProps) {
  const [folders, setFolders] = useState<FolderTreeNode[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetFolderId(null);
      fetchFolders();
    }
  }, [isOpen]);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const list = await assetsService.getFolderTree();
      // Exclude any selected folder IDs from being eligible targets to prevent circular parenting
      const filtered = list.filter((f) => !selectedIds.includes(f.id));
      setFolders(filtered);
    } catch (error) {
      toast.error('Failed to load folder list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsSubmitting(true);
      if (mode === 'move') {
        await assetsService.bulkMoveAssets(selectedIds, targetFolderId);
        toast.success(
          `Successfully moved ${selectedIds.length} ${
            selectedIds.length === 1 ? 'item' : 'items'
          }`,
        );
      } else {
        await assetsService.bulkCopyAssets(selectedIds, targetFolderId);
        toast.success(
          `Successfully copied ${selectedIds.length} ${
            selectedIds.length === 1 ? 'item' : 'items'
          }`,
        );
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${mode} selected assets`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            {mode === 'move' ? (
              <>
                <FolderInput className="h-5 w-5 text-primary" />
                Move {selectedIds.length} {selectedIds.length === 1 ? 'Item' : 'Items'}
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 text-emerald-500" />
                Copy {selectedIds.length} {selectedIds.length === 1 ? 'Item' : 'Items'}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-xs text-muted-foreground">
            Select a destination folder below:
          </p>

          <div className="border border-border rounded-lg p-2 max-h-64 overflow-y-auto space-y-1 bg-muted/20">
            {/* Root Home option */}
            <div
              onClick={() => setTargetFolderId(null)}
              className={cn(
                'flex items-center gap-2.5 p-2 rounded-md cursor-pointer transition-colors text-xs font-medium',
                targetFolderId === null
                  ? 'bg-primary/10 text-primary border border-primary/20 font-semibold'
                  : 'hover:bg-muted text-foreground',
              )}
            >
              <Home className="h-4 w-4 text-primary shrink-0" />
              <span>Home (Root Folder)</span>
            </div>

            {/* Folder List */}
            {isLoading ? (
              <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading folders...
              </div>
            ) : folders.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No subfolders available. Items will be placed in Home root.
              </div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => setTargetFolderId(folder.id)}
                  className={cn(
                    'flex items-center gap-2.5 p-2 rounded-md cursor-pointer transition-colors text-xs',
                    targetFolderId === folder.id
                      ? 'bg-primary/10 text-primary border border-primary/20 font-semibold'
                      : 'hover:bg-muted text-foreground',
                  )}
                >
                  <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-8 text-xs gradient-primary shadow-glow"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {mode === 'move' ? 'Moving...' : 'Copying...'}
              </>
            ) : (
              `${mode === 'move' ? 'Move' : 'Copy'} Here`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
