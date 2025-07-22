
import { users } from "../lib/db/schema";

export type User = typeof users.$inferSelect;

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

export type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

