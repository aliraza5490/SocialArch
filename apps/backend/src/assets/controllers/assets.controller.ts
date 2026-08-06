import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  Res,
  NotFoundException,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { diskStorage } from "multer";
import * as path from "path";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { AssetsService } from "../services/assets.service";
import {
  CreateFolderDto,
  QueryAssetsDto,
  UpdateAssetDto,
  BulkDeleteAssetsDto,
  BulkMoveAssetsDto,
  BulkCopyAssetsDto,
  SaveMarkdownDto,
} from "../dto/assets.dto";
import { JWTUser } from "@/auth/decorators/jwtUser.decorator";
import { ApiTags, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";

const uploadDir = path.join(process.cwd(), "uploads", "assets");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max file size
  },
};

@ApiTags("assets")
@ApiBearerAuth()
@Controller("assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(@JWTUser() user: any, @Query() query: QueryAssetsDto) {
    return this.assetsService.findAll(user.ID, query);
  }

  @Get("tree")
  getFolderTree(@JWTUser() user: any) {
    return this.assetsService.getFolderTree(user.ID);
  }

  @Get(":id")
  findOne(@JWTUser() user: any, @Param("id") id: string) {
    return this.assetsService.findOne(user.ID, id);
  }

  @Post("folder")
  createFolder(
    @JWTUser() user: any,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    return this.assetsService.createFolder(user.ID, createFolderDto);
  }

  @Post("save-markdown")
  saveMarkdown(
    @JWTUser() user: any,
    @Body() dto: SaveMarkdownDto,
  ) {
    return this.assetsService.saveMarkdown(user.ID, dto);
  }

  @Post("upload")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FilesInterceptor("files", 10, multerOptions))
  async uploadFiles(
    @JWTUser() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body("parentId") parentId?: string,
  ) {
    const validParentId = parentId && parentId !== "null" && parentId !== "undefined" ? parentId : undefined;
    return this.assetsService.handleFileUpload(user.ID, files || [], validParentId);
  }

  @Post("move")
  bulkMove(@JWTUser() user: any, @Body() dto: BulkMoveAssetsDto) {
    return this.assetsService.bulkMove(user.ID, dto.ids, dto.targetParentId);
  }

  @Post("copy")
  bulkCopy(@JWTUser() user: any, @Body() dto: BulkCopyAssetsDto) {
    return this.assetsService.bulkCopy(user.ID, dto.ids, dto.targetParentId);
  }

  @Get(":id/file")
  async getFile(
    @JWTUser() user: any,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const asset = await this.assetsService.findOne(user.ID, id);
    if (!asset.path || !fs.existsSync(asset.path)) {
      throw new NotFoundException("Physical file not found on server");
    }

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    if (asset.mimeType) {
      res.setHeader("Content-Type", asset.mimeType);
    }
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(asset.name)}"`,
    );

    const fileStream = fs.createReadStream(asset.path);
    fileStream.pipe(res);
  }

  @Get(":id/download")
  async downloadFile(
    @JWTUser() user: any,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const asset = await this.assetsService.findOne(user.ID, id);
    if (!asset.path || !fs.existsSync(asset.path)) {
      throw new NotFoundException("Physical file not found on server");
    }

    res.download(asset.path, asset.name);
  }

  @Patch(":id")
  update(
    @JWTUser() user: any,
    @Param("id") id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(user.ID, id, updateAssetDto);
  }

  @Delete("bulk")
  bulkDelete(@JWTUser() user: any, @Body() bulkDto: BulkDeleteAssetsDto) {
    return this.assetsService.bulkRemove(user.ID, bulkDto.ids);
  }

  @Delete(":id")
  remove(@JWTUser() user: any, @Param("id") id: string) {
    return this.assetsService.remove(user.ID, id);
  }
}
