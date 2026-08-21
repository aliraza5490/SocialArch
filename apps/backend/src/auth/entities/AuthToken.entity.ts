import { AppEntity } from "@/shared/entities/App.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class AuthToken extends AppEntity {
  @Column({ type: "varchar" })
  type: string;

  @Column({ type: "varchar" })
  token: string;

  @Column({ type: "varchar" })
  identifier: string;

  @Column({ type: "timestamp" })
  TTL: Date;
}
