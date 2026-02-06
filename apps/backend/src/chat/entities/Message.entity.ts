import { AppEntity } from "@/shared/entities/App.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
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

  @Column({ type: "int", default: 1 })
  version: number;

  @Column({ type: "uuid", nullable: true })
  parentMessageId: string | null;

  @ManyToOne(() => Message, (message) => message.children)
  parent: Message | null;

  @OneToMany(() => Message, (message) => message.parent)
  children: Message[];
}
