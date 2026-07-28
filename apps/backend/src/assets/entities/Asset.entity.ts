import { AppEntity } from "@/shared/entities/App.entity";
import { User } from "@/auth/entities/User.entity";
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";

export enum AssetType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  FOLDER = "folder",
  OTHER = "other",
}

@Entity()
export class Asset extends AppEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: true })
  filename: string | null;

  @Column({
    type: "enum",
    enum: AssetType,
    default: AssetType.OTHER,
  })
  type: AssetType;

  @Column({ type: "varchar", nullable: true })
  mimeType: string | null;

  @Column({ type: "bigint", nullable: true })
  size: number | null;

  @Column({ type: "varchar", nullable: true })
  path: string | null;

  @Column({ type: "varchar", nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: "uuid", nullable: true })
  parentId: string | null;

  @ManyToOne(() => Asset, (asset) => asset.children, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "parentId" })
  parent: Asset | null;

  @OneToMany(() => Asset, (asset) => asset.parent)
  children: Asset[];

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "text", array: true, default: "{}" })
  tags: string[];
}
