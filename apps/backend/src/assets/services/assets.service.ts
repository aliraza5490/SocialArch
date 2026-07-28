import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Asset, AssetType } from "../entities/Asset.entity";
import {
  CreateFolderDto,
  QueryAssetsDto,
  UpdateAssetDto,
} from "../dto/assets.dto";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AssetsService {
  private readonly uploadDir = path.join(process.cwd(), "uploads", "assets");

  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  determineAssetType(mimeType?: string): AssetType {
    if (!mimeType) return AssetType.OTHER;
    if (mimeType.startsWith("image/")) return AssetType.IMAGE;
    if (mimeType.startsWith("video/")) return AssetType.VIDEO;
    if (
      mimeType.startsWith("text/") ||
      mimeType.includes("pdf") ||
      mimeType.includes("word") ||
      mimeType.includes("sheet") ||
      mimeType.includes("zip")
    ) {
      return AssetType.DOCUMENT;
    }
    return AssetType.OTHER;
  }

  async createFolder(
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<Asset> {
    const { name, parentId } = createFolderDto;

    if (parentId) {
      const parent = await this.assetRepository.findOne({
        where: { ID: parentId, userId },
      });
      if (!parent || parent.type !== AssetType.FOLDER) {
        throw new NotFoundException("Parent folder not found");
      }
    }

    const folder = this.assetRepository.create({
      name,
      filename: null,
      type: AssetType.FOLDER,
      mimeType: null,
      size: null,
      path: null,
      thumbnailUrl: null,
      parentId: parentId || null,
      userId,
      tags: [],
    });

    return this.assetRepository.save(folder);
  }

  async handleFileUpload(
    userId: string,
    files: Array<Express.Multer.File>,
    parentId?: string,
  ): Promise<Asset[]> {
    if (parentId) {
      const parent = await this.assetRepository.findOne({
        where: { ID: parentId, userId },
      });
      if (!parent || parent.type !== AssetType.FOLDER) {
        throw new NotFoundException("Parent folder not found");
      }
    }

    const createdAssets: Asset[] = [];

    for (const file of files) {
      const assetType = this.determineAssetType(file.mimetype);

      const asset = this.assetRepository.create({
        name: file.originalname,
        filename: file.filename,
        type: assetType,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        thumbnailUrl: null,
        parentId: parentId || null,
        userId,
        tags: [],
      });

      const saved = await this.assetRepository.save(asset);
      createdAssets.push(saved);
    }

    return createdAssets;
  }

  async findAll(userId: string, query: QueryAssetsDto) {
    const { parentId, search, type, sortBy = "createdAt", sortOrder = "DESC" } = query;

    const queryBuilder = this.assetRepository
      .createQueryBuilder("asset")
      .where("asset.userId = :userId", { userId });

    // Handle parent folder filtering
    if (parentId && parentId !== "root" && parentId !== "null") {
      queryBuilder.andWhere("asset.parentId = :parentId", { parentId });
    } else if (!search) {
      queryBuilder.andWhere("asset.parentId IS NULL");
    }

    // Search filter across name or tags
    if (search && search.trim() !== "") {
      queryBuilder.andWhere(
        "(asset.name ILIKE :search OR :search = ANY(asset.tags))",
        { search: `%${search.trim()}%` },
      );
    }

    // Asset type filter
    if (type) {
      queryBuilder.andWhere("asset.type = :type", { type });
    }

    // Sorting logic (folders come first, then files sorted by criteria)
    const validSortColumns: Record<string, string> = {
      name: "asset.name",
      createdAt: "asset.createdAt",
      size: "asset.size",
      type: "asset.type",
    };

    const sortCol = validSortColumns[sortBy] || "asset.createdAt";

    queryBuilder
      .addOrderBy("CASE WHEN asset.type = 'folder' THEN 0 ELSE 1 END", "ASC")
      .addOrderBy(sortCol, sortOrder.toUpperCase() as "ASC" | "DESC");

    const assets = await queryBuilder.getMany();

    // Get Breadcrumbs path if inside a folder
    let breadcrumbs: Array<{ id: string | null; name: string }> = [
      { id: null, name: "Home" },
    ];

    if (parentId && parentId !== "root" && parentId !== "null") {
      breadcrumbs = await this.getFolderBreadcrumbs(userId, parentId);
    }

    return {
      assets,
      breadcrumbs,
    };
  }

  async getFolderBreadcrumbs(
    userId: string,
    currentFolderId: string,
  ): Promise<Array<{ id: string | null; name: string }>> {
    const stack: Array<{ id: string; name: string }> = [];
    let currId: string | null = currentFolderId;

    while (currId) {
      const folder = await this.assetRepository.findOne({
        where: { ID: currId, userId, type: AssetType.FOLDER },
      });

      if (!folder) break;

      stack.unshift({ id: folder.ID, name: folder.name });
      currId = folder.parentId;
    }

    return [{ id: null, name: "Home" }, ...stack];
  }

  async getFolderTree(userId: string) {
    const folders = await this.assetRepository.find({
      where: { userId, type: AssetType.FOLDER },
      order: { name: "ASC" },
    });

    return folders.map((f) => ({
      id: f.ID,
      name: f.name,
      parentId: f.parentId,
    }));
  }

  async findOne(userId: string, id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { ID: id, userId },
      relations: ["parent"],
    });

    if (!asset) {
      throw new NotFoundException("Asset not found");
    }

    return asset;
  }

  async update(
    userId: string,
    id: string,
    updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    const asset = await this.findOne(userId, id);

    if (updateAssetDto.name !== undefined) {
      asset.name = updateAssetDto.name;
    }

    if (updateAssetDto.tags !== undefined) {
      asset.tags = updateAssetDto.tags;
    }

    if (updateAssetDto.parentId !== undefined) {
      if (updateAssetDto.parentId === id) {
        throw new BadRequestException("Cannot move a folder into itself");
      }
      if (updateAssetDto.parentId !== null) {
        const parent = await this.assetRepository.findOne({
          where: { ID: updateAssetDto.parentId, userId },
        });
        if (!parent || parent.type !== AssetType.FOLDER) {
          throw new NotFoundException("Target parent folder not found");
        }
      }
      asset.parentId = updateAssetDto.parentId;
    }

    return this.assetRepository.save(asset);
  }

  async remove(userId: string, id: string): Promise<void> {
    const asset = await this.findOne(userId, id);

    if (asset.type === AssetType.FOLDER) {
      await this.removeFolderRecursive(userId, asset.ID);
    } else {
      if (asset.path && fs.existsSync(asset.path)) {
        try {
          fs.unlinkSync(asset.path);
        } catch (e) {
          console.error("Failed to delete physical file:", e);
        }
      }
      await this.assetRepository.remove(asset);
    }
  }

  private async removeFolderRecursive(
    userId: string,
    folderId: string,
  ): Promise<void> {
    const children = await this.assetRepository.find({
      where: { parentId: folderId, userId },
    });

    for (const child of children) {
      if (child.type === AssetType.FOLDER) {
        await this.removeFolderRecursive(userId, child.ID);
      } else {
        if (child.path && fs.existsSync(child.path)) {
          try {
            fs.unlinkSync(child.path);
          } catch (e) {
            console.error("Failed to delete file:", e);
          }
        }
        await this.assetRepository.remove(child);
      }
    }

    const folder = await this.assetRepository.findOne({
      where: { ID: folderId, userId },
    });
    if (folder) {
      await this.assetRepository.remove(folder);
    }
  }

  async bulkRemove(userId: string, ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.remove(userId, id);
    }
  }

  async bulkMove(
    userId: string,
    ids: string[],
    targetParentId?: string | null,
  ): Promise<void> {
    const destinationId = targetParentId && targetParentId !== "root" && targetParentId !== "null" ? targetParentId : null;

    if (destinationId) {
      const targetFolder = await this.assetRepository.findOne({
        where: { ID: destinationId, userId, type: AssetType.FOLDER },
      });
      if (!targetFolder) {
        throw new NotFoundException("Target folder not found");
      }
    }

    for (const id of ids) {
      if (id === destinationId) continue; // Skip moving folder into itself
      const asset = await this.assetRepository.findOne({ where: { ID: id, userId } });
      if (asset) {
        asset.parentId = destinationId;
        await this.assetRepository.save(asset);
      }
    }
  }

  async bulkCopy(
    userId: string,
    ids: string[],
    targetParentId?: string | null,
  ): Promise<void> {
    const destinationId = targetParentId && targetParentId !== "root" && targetParentId !== "null" ? targetParentId : null;

    if (destinationId) {
      const targetFolder = await this.assetRepository.findOne({
        where: { ID: destinationId, userId, type: AssetType.FOLDER },
      });
      if (!targetFolder) {
        throw new NotFoundException("Target folder not found");
      }
    }

    for (const id of ids) {
      const asset = await this.assetRepository.findOne({ where: { ID: id, userId } });
      if (!asset) continue;

      if (asset.type === AssetType.FOLDER) {
        await this.copyFolderRecursive(userId, asset, destinationId);
      } else {
        await this.copySingleFile(userId, asset, destinationId);
      }
    }
  }

  private async copySingleFile(
    userId: string,
    asset: Asset,
    targetParentId: string | null,
  ): Promise<Asset> {
    let newPath: string | null = null;
    let newFilename: string | null = null;

    if (asset.path && fs.existsSync(asset.path)) {
      const ext = path.extname(asset.path);
      newFilename = `${uuidv4()}${ext}`;
      newPath = path.join(this.uploadDir, newFilename);
      fs.copyFileSync(asset.path, newPath);
    }

    const isSameParent = asset.parentId === targetParentId;
    const newName = isSameParent ? `${asset.name} (Copy)` : asset.name;

    const copiedAsset = this.assetRepository.create({
      name: newName,
      filename: newFilename || asset.filename,
      type: asset.type,
      mimeType: asset.mimeType,
      size: asset.size,
      path: newPath || asset.path,
      thumbnailUrl: asset.thumbnailUrl,
      parentId: targetParentId,
      userId,
      tags: [...(asset.tags || [])],
    });

    return this.assetRepository.save(copiedAsset);
  }

  private async copyFolderRecursive(
    userId: string,
    folder: Asset,
    targetParentId: string | null,
  ): Promise<Asset> {
    const isSameParent = folder.parentId === targetParentId;
    const newFolderName = isSameParent ? `${folder.name} (Copy)` : folder.name;

    const newFolder = this.assetRepository.create({
      name: newFolderName,
      filename: null,
      type: AssetType.FOLDER,
      mimeType: null,
      size: null,
      path: null,
      thumbnailUrl: null,
      parentId: targetParentId,
      userId,
      tags: [...(folder.tags || [])],
    });

    const savedFolder = await this.assetRepository.save(newFolder);

    const children = await this.assetRepository.find({
      where: { parentId: folder.ID, userId },
    });

    for (const child of children) {
      if (child.type === AssetType.FOLDER) {
        await this.copyFolderRecursive(userId, child, savedFolder.ID);
      } else {
        await this.copySingleFile(userId, child, savedFolder.ID);
      }
    }

    return savedFolder;
  }
}
