import { AppEntity } from "@/shared/entities/App.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class User extends AppEntity {
  @Column({ type: "varchar" })
  firstName: string;

  @Column({ type: "varchar" })
  lastName: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "boolean", default: false })
  isEmailVerified: boolean;
}
