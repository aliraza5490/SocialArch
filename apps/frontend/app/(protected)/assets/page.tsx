'use client';

import { useState } from 'react';
import {
  FolderOpen,
  Grid,
  List,
  Search,
  MoreVertical,
  Image as ImageIcon,
  FileVideo,
  File,
  Download,
  Trash2,
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'folder' | 'file';
  size?: string;
  modified: string;
  thumbnail?: string;
  parentPath: string;
}

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Brand Assets',
    type: 'folder',
    modified: '2024-01-15',
    parentPath: 'Home',
  },
  {
    id: '2',
    name: 'Social Media',
    type: 'folder',
    modified: '2024-01-14',
    parentPath: 'Home',
  },
  {
    id: '3',
    name: 'Videos',
    type: 'folder',
    modified: '2024-01-13',
    parentPath: 'Home',
  },
  {
    id: '4',
    name: 'hero-banner.png',
    type: 'image',
    size: '2.4 MB',
    modified: '2024-01-12',
    thumbnail:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
    parentPath: 'Home',
  },
  {
    id: '5',
    name: 'product-demo.mp4',
    type: 'video',
    size: '45.2 MB',
    modified: '2024-01-11',
    parentPath: 'Home',
  },
  {
    id: '6',
    name: 'logo-dark.svg',
    type: 'image',
    size: '24 KB',
    modified: '2024-01-10',
    thumbnail:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
    parentPath: 'Home',
  },
];

export default function AssetsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>(['Home']);

  const currentPathString = currentPath.join('/');

  const filteredAssets = mockAssets.filter((asset) => {
    const matchesPath = asset.parentPath === currentPathString;
    const matchesSearch = asset.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesPath && matchesSearch;
  });

  const getFileIcon = (type: Asset['type'], className = "h-5 w-5") => {
    switch (type) {
      case 'folder':
        return <FolderOpen className={cn(className, "text-primary")} />;
      case 'image':
        return <ImageIcon className={cn(className, "text-emerald-500")} />;
      case 'video':
        return <FileVideo className={cn(className, "text-rose-500")} />;
      default:
        return <File className={cn(className, "text-muted-foreground")} />;
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const deselectAll = () => {
    setSelectedAssets([]);
  };

  const handleDelete = (id: string) => {
    toast.success('Asset deleted successfully!');
    setSelectedAssets((prev) => prev.filter((assetId) => assetId !== id));
  };

  const handleDownload = () => {
    toast.success('Download started!');
  };

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Assets</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage and organize your assets
          </p>
        </div>
        <Button 
          size="sm"
          className="hidden md:flex px-4 h-8 text-xs font-medium gradient-primary shadow-glow hover:opacity-90 transition-opacity"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Upload
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-0.5 text-xs">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            setCurrentPath(['Home']);
            setSelectedAssets([]);
          }}
        >
          <Home className="h-3.5 w-3.5" />
        </Button>
        {currentPath.map((path, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
              onClick={() => {
                setCurrentPath(currentPath.slice(0, index + 1));
                setSelectedAssets([]);
              }}
            >
              {path}
            </Button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2.5 p-2 bg-card border border-border rounded-lg shadow-sm">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              if (currentPath.length > 1) {
                setCurrentPath(currentPath.slice(0, -1));
                setSelectedAssets([]);
              }
            }}
            disabled={currentPath.length <= 1}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setCurrentPath(['Home']);
              setSelectedAssets([]);
            }}
          >
            <Home className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs pl-8 pr-2.5"
          />
        </div>

        {/* View mode toggle */}
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

        {/* Selection controls */}
        {selectedAssets.length > 0 && (
          <div className="flex items-center gap-1.5 ml-auto animate-scale-in">
            <span className="text-xs text-muted-foreground">
              {selectedAssets.length} selected
            </span>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={deselectAll}>
              Deselect All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleDownload()}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleDelete(selectedAssets[0])}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Assets */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={cn(
                'group relative bg-card border border-border rounded-lg p-2.5 hover:shadow-card-hover transition-all cursor-pointer animate-scale-in',
                selectedAssets.includes(asset.id) &&
                  'ring-2 ring-primary border-primary',
              )}
              onClick={() => {
                if (asset.type === 'folder') {
                  setCurrentPath([...currentPath, asset.name]);
                  setSelectedAssets([]);
                } else {
                  toggleSelect(asset.id);
                }
              }}
            >
              <div className="flex flex-col items-center text-center">
                {asset.thumbnail ? (
                  <div className="h-12 w-12 rounded-md overflow-hidden mb-2 bg-muted">
                    <Image
                      src={asset.thumbnail}
                      alt={asset.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center mb-2">
                    {getFileIcon(asset.type, 'h-6 w-6')}
                  </div>
                )}
                <p className="text-xs font-medium truncate w-full">
                  {asset.name}
                </p>
                {asset.size && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {asset.size}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1.5 right-1.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload()}>
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(asset.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
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
                  Modified
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className={cn(
                    'border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors',
                    selectedAssets.includes(asset.id) && 'bg-primary/5',
                  )}
                  onClick={() => {
                    if (asset.type === 'folder') {
                      setCurrentPath([...currentPath, asset.name]);
                      setSelectedAssets([]);
                    } else {
                      toggleSelect(asset.id);
                    }
                  }}
                >
                  <td className="p-2 px-3">
                    <div className="flex items-center gap-2.5">
                      {asset.thumbnail ? (
                        <div className="h-6 w-6 rounded overflow-hidden bg-muted">
                          <Image
                            src={asset.thumbnail}
                            alt={asset.name}
                            width={24}
                            height={24}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-6 w-6 flex items-center justify-center">
                          {getFileIcon(asset.type, 'h-4 w-4')}
                        </div>
                      )}
                      <span className="text-xs font-medium">
                        {asset.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 px-3">
                    <span className="text-xs text-muted-foreground capitalize">
                      {asset.type}
                    </span>
                  </td>
                  <td className="p-2 px-3">
                    <span className="text-xs text-muted-foreground">
                      {asset.size || '—'}
                    </span>
                  </td>
                  <td className="p-2 px-3">
                    <span className="text-xs text-muted-foreground">
                      {asset.modified}
                    </span>
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload()}>
                          <Download className="h-3.5 w-3.5 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(asset.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
