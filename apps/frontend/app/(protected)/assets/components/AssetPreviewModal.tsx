'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Trash2,
  Edit2,
  Check,
  Tag,
  Calendar,
  HardDrive,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  Eye,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';
import { Asset, assetsService } from '@/lib/services/assets.service';
import { MarkdownContent } from '@/components/markdown-content';
import { cn } from '@/lib/utils';

interface AssetPreviewModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

const isMarkdownFile = (a: Asset) => {
  const name = a.name.toLowerCase();
  const mime = (a.mimeType || '').toLowerCase();
  return (
    name.endsWith('.md') ||
    name.endsWith('.markdown') ||
    mime.includes('markdown') ||
    mime === 'text/markdown'
  );
};

export function AssetPreviewModal({
  asset,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: AssetPreviewModalProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [previewTab, setPreviewTab] = useState<'rendered' | 'raw'>('rendered');
  const [imageError, setImageError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let createdUrl: string | null = null;

    if (asset) {
      setName(asset.name);
      setTags(asset.tags || []);
      setIsEditingName(false);
      setImageError(false);
      setBlobUrl(null);

      const isImg =
        asset.type === 'image' || (!!asset.mimeType && asset.mimeType.startsWith('image/'));

      if (isImg) {
        setIsLoadingMedia(true);
        assetsService
          .getFileBlob(asset.ID)
          .then((blob) => {
            if (!isMounted) return;
            createdUrl = URL.createObjectURL(blob);
            setBlobUrl(createdUrl);
          })
          .catch((err) => {
            if (!isMounted) return;
            console.error('Failed to load asset blob:', err);
            setImageError(true);
          })
          .finally(() => {
            if (isMounted) setIsLoadingMedia(false);
          });
      } else if (isMarkdownFile(asset)) {
        setIsLoadingContent(true);
        setMarkdownContent(null);
        assetsService
          .getFileContent(asset.ID)
          .then((content) => {
            if (!isMounted) return;
            setMarkdownContent(content);
          })
          .catch((err) => {
            if (!isMounted) return;
            console.error('Failed to fetch markdown content:', err);
            toast.error('Could not load markdown content');
          })
          .finally(() => {
            if (isMounted) setIsLoadingContent(false);
          });
      } else {
        setMarkdownContent(null);
      }
    }

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [asset]);

  if (!asset) return null;

  const fileUrl = assetsService.getFileUrl(asset.ID);
  const downloadUrl = assetsService.getDownloadUrl(asset.ID);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;
    try {
      setIsSaving(true);
      await assetsService.updateAsset(asset.ID, { name: name.trim() });
      toast.success('Asset renamed successfully');
      setIsEditingName(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to rename asset');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    const updatedTags = [...tags, newTag.trim().toLowerCase()];
    try {
      setTags(updatedTags);
      setNewTag('');
      await assetsService.updateAsset(asset.ID, { tags: updatedTags });
      toast.success('Tag added');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update tags');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    try {
      setTags(updatedTags);
      await assetsService.updateAsset(asset.ID, { tags: updatedTags });
      toast.success('Tag removed');
      onUpdate();
    } catch (error) {
      toast.error('Failed to remove tag');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>Asset Preview: {asset.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px]">
          {/* Media Preview Area */}
          <div className="md:col-span-7 bg-muted/40 p-4 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-border min-h-[300px]">
            {isMarkdownFile(asset) ? (
              <div className="flex flex-col w-full h-full space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Markdown Content</span>
                  </div>
                  <div className="flex items-center gap-1 bg-muted rounded-md p-0.5 border border-border">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('rendered')}
                      className={cn(
                        'flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-sm font-medium transition-colors',
                        previewTab === 'rendered'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('raw')}
                      className={cn(
                        'flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-sm font-medium transition-colors',
                        previewTab === 'raw'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Code className="h-3 w-3" />
                      Raw
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full max-h-[360px] min-h-[260px] overflow-y-auto p-4 bg-background/80 rounded-xl border border-border/80 shadow-inner text-left">
                  {isLoadingContent ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs">Loading markdown content...</span>
                    </div>
                  ) : previewTab === 'rendered' ? (
                    <MarkdownContent content={markdownContent || '*Empty document*'} />
                  ) : (
                    <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground/90">
                      {markdownContent || ''}
                    </pre>
                  )}
                </div>
              </div>
            ) : (asset.type === 'image' || (!!asset.mimeType && asset.mimeType.startsWith('image/'))) && !imageError ? (
              <div className="relative w-full h-full min-h-[260px] flex items-center justify-center">
                {isLoadingMedia || !blobUrl ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs">Loading image preview...</span>
                  </div>
                ) : (
                  <img
                    src={blobUrl}
                    alt={asset.name}
                    className="max-h-[360px] max-w-full object-contain rounded-lg shadow-md"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            ) : asset.type === 'video' ? (
              <video
                src={fileUrl}
                controls
                className="max-h-[360px] max-w-full rounded-lg shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                {asset.type === 'document' ? (
                  <FileText className="h-16 w-16 text-primary mb-3 stroke-[1.5]" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-muted-foreground mb-3 stroke-[1.5]" />
                )}
                <p className="text-sm font-medium text-foreground">{asset.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {asset.mimeType || 'Document'}
                </p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                >
                  Open in tab <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Details & Actions Panel */}
          <div className="md:col-span-5 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Header / Name Edit */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-8 text-xs font-semibold"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-500 hover:text-emerald-600"
                        onClick={handleSaveName}
                        disabled={isSaving}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                      <h2 className="text-base font-bold tracking-tight truncate max-w-[200px]" title={asset.name}>
                        {asset.name}
                      </h2>
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                  {asset.type} File
                </p>
              </div>

              {/* Metadata Info */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="h-4 w-4 text-primary shrink-0" />
                  <span>Size:</span>
                  <span className="font-medium text-foreground ml-auto">
                    {formatFileSize(asset.size)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>Uploaded:</span>
                  <span className="font-medium text-foreground ml-auto">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {asset.mimeType && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span>MIME:</span>
                    <span className="font-medium text-foreground ml-auto truncate max-w-[140px]">
                      {asset.mimeType}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  <span>Tags</span>
                </div>

                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {tags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 gap-1 group"
                    >
                      {t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-destructive text-muted-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-[11px] text-muted-foreground italic">
                      No tags assigned
                    </p>
                  )}
                </div>

                <form onSubmit={handleAddTag} className="flex gap-1.5 pt-1">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="h-7 text-[11px]"
                  />
                  <Button type="submit" size="sm" variant="outline" className="h-7 text-[11px] px-2">
                    Add
                  </Button>
                </form>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-border">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs gradient-primary shadow-glow"
                onClick={async () => {
                  try {
                    await assetsService.downloadAssetFile(asset.ID, asset.name);
                    toast.success('Download started');
                  } catch (error) {
                    toast.error('Failed to download file');
                  }
                }}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  onDelete(asset.ID);
                  onClose();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
