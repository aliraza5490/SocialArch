import { AppEntity } from "@/shared/entities/App.entity";
import { Column, Entity, Index } from "typeorm";

@Entity()
class LoginLog extends AppEntity {
  @Column({
    unique: true,
  })
  @Index({ unique: true })
  ip: string;

  @Column()
  retries: number;

  @Column({
    nullable: true,
    default: new Date(),
  })
  blockedUntil: Date;

  @Column({
    nullable: true,
    default: new Date(),
  })
  lastLogin: Date;
}

export default LoginLog;
