'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen,
  Grid,
  List,
  Search,
  MoreVertical,
  Image as ImageIcon,
  FileVideo,
  FileText,
  File,
  Download,
  Trash2,
  Home,
  ChevronRight,
  Plus,
  FolderPlus,
  ArrowUpDown,
  Eye,
  CheckSquare,
  Square,
  Copy,
  FolderInput,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Asset,
  BreadcrumbItem,
  assetsService,
} from '@/lib/services/assets.service';
import { CreateFolderModal } from './CreateFolderModal';
import { UploadModal } from './UploadModal';
import { AssetPreviewModal } from './AssetPreviewModal';
import { MoveAssetsModal } from './MoveAssetsModal';

export function AssetsContainer() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: 'Home' },
  ]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'size' | 'type'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [moveModalConfig, setMoveModalConfig] = useState<{
    isOpen: boolean;
    mode: 'move' | 'copy';
    ids: string[];
  }>({
    isOpen: false,
    mode: 'move',
    ids: [],
  });

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await assetsService.getAssets({
        parentId: currentParentId,
        search: searchQuery,
        sortBy,
        sortOrder,
      });
      setAssets(res.assets);
      if (res.breadcrumbs && res.breadcrumbs.length > 0) {
        setBreadcrumbs(res.breadcrumbs);
      }
    } catch (error) {
      toast.error('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  }, [currentParentId, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const getFileIcon = (type: Asset['type'], className = 'h-5 w-5') => {
    switch (type) {
      case 'folder':
        return <FolderOpen className={cn(className, 'text-primary')} />;
      case 'image':
        return <ImageIcon className={cn(className, 'text-emerald-500')} />;
      case 'video':
        return <FileVideo className={cn(className, 'text-rose-500')} />;
      case 'document':
        return <FileText className={cn(className, 'text-sky-500')} />;
      default:
        return <File className={cn(className, 'text-muted-foreground')} />;
    }
  };

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((a) => a.ID));
    }
  };

  const deselectAll = () => {
    setSelectedAssets([]);
  };

  const handleDelete = async (id: string) => {
    try {
      await assetsService.deleteAsset(id);
      toast.success('Asset deleted successfully');
      setSelectedAssets((prev) => prev.filter((assetId) => assetId !== id));
      fetchAssets();
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) return;
    try {
      await assetsService.bulkDeleteAssets(selectedAssets);
      toast.success(`${selectedAssets.length} items deleted`);
      setSelectedAssets([]);
      fetchAssets();
    } catch (error) {
      toast.error('Failed to delete selected assets');
    }
  };

  const handleDownload = async (asset: Asset) => {
    if (asset.type === 'folder') return;
    try {
      await assetsService.downloadAssetFile(asset.ID, asset.name);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Assets</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage, organize, and upload media assets and files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFolderModalOpen(true)}
            className="h-8 text-xs font-medium px-3"
          >
            <FolderPlus className="mr-1.5 h-3.5 w-3.5 text-primary" />
            New Folder
          </Button>
          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 h-8 text-xs font-medium gradient-primary shadow-glow hover:opacity-90 transition-opacity"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Upload
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-0.5 text-xs flex-wrap bg-card border border-border rounded-md px-2 py-1">
        {breadcrumbs.map((item, index) => (
          <div key={item.id || 'root'} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 mx-0.5" />
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground font-medium',
                index === breadcrumbs.length - 1 && 'text-foreground font-semibold',
              )}
              onClick={() => {
                setCurrentParentId(item.id);
                setSelectedAssets([]);
              }}
            >
              {index === 0 && <Home className="h-3.5 w-3.5 mr-1" />}
              {item.name}
            </Button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2.5 p-2 bg-card border border-border rounded-lg shadow-sm flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs pl-8 pr-2.5"
          />
        </div>

        {/* Sort Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1.5">
              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
              <span>Sort: {sortBy}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem onClick={() => setSortBy('name')}>
              Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
              Date Uploaded
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('size')}>
              Size
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('type')}>
              Type
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}>
              Order: {sortOrder === 'ASC' ? 'Ascending' : 'Descending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 p-0',
              viewMode === 'grid' && 'bg-background shadow-sm',
            )}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 p-0',
              viewMode === 'list' && 'bg-background shadow-sm',
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Multiselect Toolbar */}
        <div className="flex items-center gap-1.5 ml-auto">
          {assets.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={selectAll}
            >
              {selectedAssets.length === assets.length && assets.length > 0 ? (
                <CheckSquare className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Square className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {selectedAssets.length === assets.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}

          {selectedAssets.length > 0 && (
            <div className="flex items-center gap-1.5 animate-scale-in">
              <span className="text-xs font-semibold text-primary">
                {selectedAssets.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  setMoveModalConfig({
                    isOpen: true,
                    mode: 'copy',
                    ids: selectedAssets,
                  })
                }
              >
                <Copy className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  setMoveModalConfig({
                    isOpen: true,
                    mode: 'move',
                    ids: selectedAssets,
                  })
                }
              >
                <FolderInput className="h-3.5 w-3.5 mr-1 text-primary" />
                Move
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Asset Grid / List View */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-xl">
          <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-sm font-semibold">No assets found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {searchQuery
              ? 'No files match your search filter.'
              : 'Upload files or create a new folder to get started.'}
          </p>
          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 h-8 text-xs gradient-primary"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Upload Files
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {assets.map((asset) => {
            const isSelected = selectedAssets.includes(asset.ID);
            return (
              <div
                key={asset.ID}
                className={cn(
                  'group relative bg-card border border-border rounded-lg p-2.5 hover:shadow-card-hover transition-all cursor-pointer animate-scale-in',
                  isSelected && 'ring-2 ring-primary border-primary bg-primary/5',
                )}
                onClick={() => {
                  if (asset.type === 'folder') {
                    setCurrentParentId(asset.ID);
                    setSelectedAssets([]);
                  } else {
                    setPreviewAsset(asset);
                  }
                }}
              >
                {/* Selection Checkbox */}
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => toggleSelect(asset.ID, e)}
                >
                  <Checkbox
                    checked={isSelected}
                    className={cn(
                      'h-4 w-4 rounded transition-opacity',
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                  />
                </div>

                <div className="flex flex-col items-center text-center pt-2">
                  {asset.type === 'image' ? (
                    <div className="h-16 w-full rounded-md overflow-hidden mb-2 bg-muted relative flex items-center justify-center">
                      <img
                        src={assetsService.getFileUrl(asset.ID)}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-full flex items-center justify-center mb-2 bg-muted/20 rounded-md">
                      {getFileIcon(asset.type, 'h-8 w-8')}
                    </div>
                  )}
                  <p className="text-xs font-medium truncate w-full" title={asset.name}>
                    {asset.name}
                  </p>
                  {asset.type !== 'folder' && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatFileSize(asset.size)}
                    </p>
                  )}
                </div>

                {/* Context Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1.5 right-1.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-xs">
                    {asset.type !== 'folder' && (
                      <DropdownMenuItem onClick={() => setPreviewAsset(asset)}>
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        Preview
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        setMoveModalConfig({
                          isOpen: true,
                          mode: 'copy',
                          ids: [asset.ID],
                        })
                      }
                    >
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setMoveModalConfig({
                          isOpen: true,
                          mode: 'move',
                          ids: [asset.ID],
                        })
                      }
                    >
                      <FolderInput className="h-3.5 w-3.5 mr-2" />
                      Move
                    </DropdownMenuItem>
                    {asset.type !== 'folder' && (
                      <DropdownMenuItem onClick={() => handleDownload(asset)}>
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Download
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(asset.ID)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-10 p-2.5 px-3">
                  <Checkbox
                    checked={selectedAssets.length === assets.length && assets.length > 0}
                    onCheckedChange={selectAll}
                    className="h-4 w-4 rounded"
                  />
                </th>
                <th className="text-left text-[11px] font-medium text-muted-foreground p-2.5 px-3">
                  Name
                </th>
                <th className="text-left text-[11px] font-medium text-muted-foreground p-2.5 px-3">
                  Type
                </th>
                <th className="text-left text-[11px] font-medium text-muted-foreground p-2.5 px-3">
                  Size
                </th>
                <th className="text-left text-[11px] font-medium text-muted-foreground p-2.5 px-3">
                  Uploaded
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const isSelected = selectedAssets.includes(asset.ID);
                return (
                  <tr
                    key={asset.ID}
                    className={cn(
                      'border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors text-xs',
                      isSelected && 'bg-primary/5',
                    )}
                    onClick={() => {
                      if (asset.type === 'folder') {
                        setCurrentParentId(asset.ID);
                        setSelectedAssets([]);
                      } else {
                        setPreviewAsset(asset);
                      }
                    }}
                  >
                    <td className="p-2 px-3" onClick={(e) => toggleSelect(asset.ID, e)}>
                      <Checkbox checked={isSelected} className="h-4 w-4 rounded" />
                    </td>
                    <td className="p-2 px-3">
                      <div className="flex items-center gap-2.5">
                        {asset.type === 'image' ? (
                          <div className="h-7 w-7 rounded overflow-hidden bg-muted shrink-0">
                            <img
                              src={assetsService.getFileUrl(asset.ID)}
                              alt={asset.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-7 w-7 flex items-center justify-center shrink-0">
                            {getFileIcon(asset.type, 'h-4 w-4')}
                          </div>
                        )}
                        <span className="font-medium truncate max-w-[240px]">
                          {asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 px-3 text-muted-foreground capitalize">
                      {asset.type}
                    </td>
                    <td className="p-2 px-3 text-muted-foreground">
                      {formatFileSize(asset.size)}
                    </td>
                    <td className="p-2 px-3 text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 px-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          {asset.type !== 'folder' && (
                            <DropdownMenuItem onClick={() => setPreviewAsset(asset)}>
                              <Eye className="h-3.5 w-3.5 mr-2" />
                              Preview
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              setMoveModalConfig({
                                isOpen: true,
                                mode: 'copy',
                                ids: [asset.ID],
                              })
                            }
                          >
                            <Copy className="h-3.5 w-3.5 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setMoveModalConfig({
                                isOpen: true,
                                mode: 'move',
                                ids: [asset.ID],
                              })
                            }
                          >
                            <FolderInput className="h-3.5 w-3.5 mr-2" />
                            Move
                          </DropdownMenuItem>
                          {asset.type !== 'folder' && (
                            <DropdownMenuItem onClick={() => handleDownload(asset)}>
                              <Download className="h-3.5 w-3.5 mr-2" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(asset.ID)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        parentId={currentParentId}
        onSuccess={fetchAssets}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        parentId={currentParentId}
        onSuccess={fetchAssets}
      />

      <AssetPreviewModal
        asset={previewAsset}
        isOpen={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
        onUpdate={fetchAssets}
        onDelete={handleDelete}
      />

      <MoveAssetsModal
        isOpen={moveModalConfig.isOpen}
        mode={moveModalConfig.mode}
        selectedIds={moveModalConfig.ids}
        onClose={() =>
          setMoveModalConfig({ isOpen: false, mode: 'move', ids: [] })
        }
        onSuccess={() => {
          setSelectedAssets([]);
          fetchAssets();
        }}
      />
    </div>
  );
}
