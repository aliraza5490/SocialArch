import { AppEntity } from "@/shared/entities/App.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class AuthToken extends AppEntity {
  @Column()
  type: string;

  @Column()
  token: string;

  @Column()
  identifier: string;

  @Column()
  TTL: Date;
}
