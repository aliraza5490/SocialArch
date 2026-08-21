import { AppEntity } from "@/shared/entities/App.entity";
import { Column, Entity, Index } from "typeorm";

@Entity()
class LoginLog extends AppEntity {
  @Column({
    type: "varchar",
    unique: true,
  })
  @Index({ unique: true })
  ip: string;

  @Column({ type: "int", default: 0 })
  retries: number;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  blockedUntil: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  lastLogin: Date;
}

export default LoginLog;
