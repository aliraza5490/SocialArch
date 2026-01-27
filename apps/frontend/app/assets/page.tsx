'use client';

import { useState } from 'react';
import {
  FolderOpen,
  Grid,
  List,
  Search,
  MoreVertical,
  Image,
  FileVideo,
  File,
  Download,
  Trash2,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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

  const getFileIcon = (type: Asset['type']) => {
    switch (type) {
      case 'folder':
        return <FolderOpen className="h-8 w-8 text-primary" />;
      case 'image':
        return <Image className="h-8 w-8 text-emerald-500" />;
      case 'video':
        return <FileVideo className="h-8 w-8 text-rose-500" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
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

  const handleDownload = (id: string) => {
    toast.success('Download started!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage and organize your assets
            </p>
          </div>
          <Button className="gradient-primary shadow-glow hover:opacity-90 transition-opacity">
            Upload
          </Button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => {
              setCurrentPath(['Home']);
              setSelectedAssets([]);
            }}
          >
            <Home className="h-4 w-4" />
          </Button>
          {currentPath.map((path, index) => (
            <div key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
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
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-card">
          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                if (currentPath.length > 1) {
                  setCurrentPath(currentPath.slice(0, -1));
                  setSelectedAssets([]);
                }
              }}
              disabled={currentPath.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setCurrentPath(['Home']);
                setSelectedAssets([]);
              }}
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                viewMode === 'grid' && 'bg-background shadow-sm',
              )}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                viewMode === 'list' && 'bg-background shadow-sm',
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Selection controls */}
          {selectedAssets.length > 0 && (
            <div className="flex items-center gap-2 ml-auto animate-scale-in">
              <span className="text-sm text-muted-foreground">
                {selectedAssets.length} selected
              </span>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(selectedAssets[0])}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedAssets[0])}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Assets */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={cn(
                  'group relative bg-card border border-border rounded-xl p-4 hover:shadow-card-hover transition-all cursor-pointer animate-scale-in',
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
                    <div className="h-16 w-16 rounded-lg overflow-hidden mb-3 bg-muted">
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 flex items-center justify-center mb-3">
                      {getFileIcon(asset.type)}
                    </div>
                  )}
                  <p className="text-sm font-medium truncate w-full">
                    {asset.name}
                  </p>
                  {asset.size && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {asset.size}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(asset.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(asset.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">
                    Type
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">
                    Size
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">
                    Modified
                  </th>
                  <th className="w-10"></th>
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
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {asset.thumbnail ? (
                          <div className="h-8 w-8 rounded overflow-hidden bg-muted">
                            <img
                              src={asset.thumbnail}
                              alt={asset.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 flex items-center justify-center">
                            {getFileIcon(asset.type)}
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground capitalize">
                        {asset.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {asset.size || '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {asset.modified}
                      </span>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDownload(asset.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
    </DashboardLayout>
  );
}
