import { AppEntity } from "@/shared/entities/App.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Chat } from "./Chat.entity";

@Entity()
export class Message extends AppEntity {
  @Column({ type: "uuid" })
  chatId: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @Column({ type: "varchar" })
  role: "user" | "assistant";

  @Column({ type: "text" })
  content: string;

  @Column({ type: "int", default: 0 })
  position: number;

  @Column({ type: "int", default: 1 })
  version: number;
}
