import { AppEntity } from "@/shared/entities/App.entity";
import { User } from "@/auth/entities/User.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Message } from "./Message.entity";

@Entity()
export class Chat extends AppEntity {
  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
