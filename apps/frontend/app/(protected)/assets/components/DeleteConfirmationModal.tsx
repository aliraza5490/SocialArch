'use client';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Asset } from '@/lib/services/assets.service';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  item?: Asset | null;
  selectedCount?: number;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  item,
  selectedCount = 0,
}: DeleteConfirmationModalProps) {
  const isBulk = selectedCount > 1 || (!item && selectedCount > 0);

  const getTitle = () => {
    if (isBulk) {
      return `Delete ${selectedCount} Items`;
    }
    if (item?.type === 'folder') {
      return `Delete Folder "${item.name}"`;
    }
    return `Delete "${item?.name || 'File'}"`;
  };

  const getDescription = () => {
    if (isBulk) {
      return `Are you sure you want to delete these ${selectedCount} items? This action cannot be undone and will permanently remove the selected files and folders.`;
    }
    if (item?.type === 'folder') {
      return `Are you sure you want to delete the folder "${item.name}" and all of its contents? This action cannot be undone.`;
    }
    return `Are you sure you want to delete "${item?.name || 'this file'}"? This action cannot be undone.`;
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isDeleting}
      title={getTitle()}
      description={getDescription()}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
  );
}
