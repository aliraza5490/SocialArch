'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Folder,
  FolderOpen,
  Home,
  ChevronRight,
  ChevronDown,
  Copy,
  FolderInput,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  FolderTreeNode,
  assetsService,
} from '@/lib/services/assets.service';
import { cn } from '@/lib/utils';

interface TreeFolderNode extends FolderTreeNode {
  children: TreeFolderNode[];
}

function buildFolderTree(
  nodes: FolderTreeNode[],
  selectedIds: string[],
): TreeFolderNode[] {
  // Find all invalid target folder IDs (selected folders and their recursive descendants)
  const invalidSet = new Set<string>(selectedIds);
  let added = true;
  while (added) {
    added = false;
    for (const node of nodes) {
      if (
        node.parentId &&
        invalidSet.has(node.parentId) &&
        !invalidSet.has(node.id)
      ) {
        invalidSet.add(node.id);
        added = true;
      }
    }
  }

  // Filter out invalid folders
  const validNodes = nodes.filter((n) => !invalidSet.has(n.id));

  // Map of nodes
  const nodeMap = new Map<string, TreeFolderNode>();
  validNodes.forEach((node) => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  const rootNodes: TreeFolderNode[] = [];

  validNodes.forEach((node) => {
    const treeNode = nodeMap.get(node.id)!;
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(treeNode);
    } else {
      rootNodes.push(treeNode);
    }
  });

  return rootNodes;
}

interface FolderTreeItemProps {
  node: TreeFolderNode;
  level: number;
  targetFolderId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

function FolderTreeItem({
  node,
  level,
  targetFolderId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: FolderTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = targetFolderId === node.id;

  return (
    <div className="flex flex-col">
      <div
        onClick={() => onSelect(node.id)}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        className={cn(
          'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-xs font-medium select-none',
          isSelected
            ? 'bg-primary/10 text-primary border border-primary/20 font-semibold'
            : 'hover:bg-muted text-foreground',
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="p-0.5 hover:bg-muted-foreground/20 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}

        {isSelected || isExpanded ? (
          <FolderOpen className="h-4 w-4 text-primary shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-primary/80 shrink-0" />
        )}

        <span className="truncate">{node.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-1 mt-1">
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              targetFolderId={targetFolderId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
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
      setFolders(list);
      // Auto-expand all folders by default so user sees full tree structure immediately
      setExpandedIds(new Set(list.map((f) => f.id)));
    } catch (error) {
      toast.error('Failed to load folder list');
    } finally {
      setIsLoading(false);
    }
  };

  const treeNodes = useMemo(
    () => buildFolderTree(folders, selectedIds),
    [folders, selectedIds],
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
                'flex items-center gap-2.5 p-2 rounded-md cursor-pointer transition-colors text-xs font-medium select-none',
                targetFolderId === null
                  ? 'bg-primary/10 text-primary border border-primary/20 font-semibold'
                  : 'hover:bg-muted text-foreground',
              )}
            >
              <Home className="h-4 w-4 text-primary shrink-0" />
              <span>Home (Root Folder)</span>
            </div>

            {/* Folder Tree List */}
            {isLoading ? (
              <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading folders...
              </div>
            ) : treeNodes.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No subfolders available. Items will be placed in Home root.
              </div>
            ) : (
              treeNodes.map((node) => (
                <FolderTreeItem
                  key={node.id}
                  node={node}
                  level={0}
                  targetFolderId={targetFolderId}
                  onSelect={setTargetFolderId}
                  expandedIds={expandedIds}
                  onToggleExpand={toggleExpand}
                />
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

