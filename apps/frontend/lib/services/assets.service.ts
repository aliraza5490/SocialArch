import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/lib/utils/jwt";

export interface Asset {
  ID: string;
  name: string;
  filename?: string | null;
  type: "image" | "video" | "document" | "folder" | "other";
  mimeType?: string | null;
  size?: number | null;
  path?: string | null;
  thumbnailUrl?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface FolderTreeNode {
  id: string;
  name: string;
  parentId?: string | null;
}

export interface AssetsResponse {
  assets: Asset[];
  breadcrumbs: BreadcrumbItem[];
}

export interface QueryAssetsParams {
  parentId?: string | null;
  search?: string;
  type?: string;
  sortBy?: "name" | "createdAt" | "size" | "type";
  sortOrder?: "ASC" | "DESC";
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const assetsService = {
  async getAssets(params?: QueryAssetsParams): Promise<AssetsResponse> {
    const res = await apiClient.get<AssetsResponse>("/assets", {
      params: {
        parentId: params?.parentId || undefined,
        search: params?.search || undefined,
        type: params?.type || undefined,
        sortBy: params?.sortBy || "createdAt",
        sortOrder: params?.sortOrder || "DESC",
      },
    });
    return res.data;
  },

  async getFolderTree(): Promise<FolderTreeNode[]> {
    const res = await apiClient.get<FolderTreeNode[]>("/assets/tree");
    return res.data;
  },

  async getAsset(id: string): Promise<Asset> {
    const res = await apiClient.get<Asset>(`/assets/${id}`);
    return res.data;
  },

  async createFolder(name: string, parentId?: string | null): Promise<Asset> {
    const res = await apiClient.post<Asset>("/assets/folder", {
      name,
      parentId: parentId || undefined,
    });
    return res.data;
  },

  async uploadAssets(
    files: File[],
    parentId?: string | null,
    onProgress?: (progress: number) => void,
  ): Promise<Asset[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    if (parentId) {
      formData.append("parentId", parentId);
    }

    const res = await apiClient.post<Asset[]>("/assets/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });
    return res.data;
  },

  async updateAsset(
    id: string,
    data: { name?: string; tags?: string[]; parentId?: string | null },
  ): Promise<Asset> {
    const res = await apiClient.patch<Asset>(`/assets/${id}`, data);
    return res.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`);
  },

  async bulkDeleteAssets(ids: string[]): Promise<void> {
    await apiClient.delete("/assets/bulk", {
      data: { ids },
    });
  },

  async bulkMoveAssets(
    ids: string[],
    targetParentId?: string | null,
  ): Promise<void> {
    await apiClient.post("/assets/move", {
      ids,
      targetParentId: targetParentId || null,
    });
  },

  async bulkCopyAssets(
    ids: string[],
    targetParentId?: string | null,
  ): Promise<void> {
    await apiClient.post("/assets/copy", {
      ids,
      targetParentId: targetParentId || null,
    });
  },

  getFileUrl(assetId: string): string {
    const token = getAccessToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    return `${API_BASE_URL}/assets/${assetId}/file${tokenQuery}`;
  },

  getDownloadUrl(assetId: string): string {
    const token = getAccessToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    return `${API_BASE_URL}/assets/${assetId}/download${tokenQuery}`;
  },

  async downloadAssetFile(assetId: string, filename: string): Promise<void> {
    const response = await apiClient.get<Blob>(`/assets/${assetId}/download`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data as unknown as BlobPart]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async saveMarkdownAsset(data: {
    name: string;
    content: string;
    parentId?: string | null;
    tags?: string[];
  }): Promise<Asset> {
    const res = await apiClient.post<Asset>("/assets/save-markdown", {
      name: data.name,
      content: data.content,
      parentId: data.parentId || undefined,
      tags: data.tags || ["markdown", "saved-response"],
    });
    return res.data;
  },

  async getFileContent(assetId: string): Promise<string> {
    const res = await apiClient.get<string>(`/assets/${assetId}/file`, {
      responseType: "text",
    });
    return res.data;
  },
};
