import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { AssetType } from "../entities/Asset.entity";

export class CreateFolderDto {
  @ApiProperty({ description: "Folder name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Parent folder UUID" })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateAssetDto {
  @ApiPropertyOptional({ description: "Asset display name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Target parent folder UUID" })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: "Tags for asset", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class QueryAssetsDto {
  @ApiPropertyOptional({ description: "Parent folder UUID ('root' or empty for top-level)" })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: "Search query for name or tags" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AssetType })
  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType;

  @ApiPropertyOptional({ description: "Sort column ('name', 'createdAt', 'size', 'type')" })
  @IsOptional()
  @IsString()
  sortBy?: "name" | "createdAt" | "size" | "type";

  @ApiPropertyOptional({ description: "Sort direction ('ASC' | 'DESC')" })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC";
}

export class BulkDeleteAssetsDto {
  @ApiProperty({ description: "Array of asset UUIDs to delete", type: [String] })
  @IsArray()
  @IsUUID("all", { each: true })
  ids: string[];
}

export class BulkMoveAssetsDto {
  @ApiProperty({ description: "Array of asset UUIDs to move", type: [String] })
  @IsArray()
  @IsUUID("all", { each: true })
  ids: string[];

  @ApiPropertyOptional({ description: "Target folder UUID (null or empty for root)" })
  @IsOptional()
  @IsString()
  targetParentId?: string | null;
}

export class BulkCopyAssetsDto {
  @ApiProperty({ description: "Array of asset UUIDs to copy", type: [String] })
  @IsArray()
  @IsUUID("all", { each: true })
  ids: string[];

  @ApiPropertyOptional({ description: "Target folder UUID (null or empty for root)" })
  @IsOptional()
  @IsString()
  targetParentId?: string | null;
}
