import { CommandsRegistry, CommandHandler, UserCommandHandler, User } from '../types/command';
import { getCurrentUser } from '../lib/user';
import { findUserByName } from '../lib/db/queries/users';
import { handlerLogin } from './login';
import { handlerRegister } from './register';
import { handlerReset } from './reset';
import { handlerGetUsers } from './getusers';
import { handlerAgg } from './agg';
import { handlerAddFeed, handlerFeeds, handlerFollowFeed, handlerFeedFollowing, handlerUnfollowFeed } from './feeds';
import { handlerBrowse } from './browse';

export const registry: CommandsRegistry = {};

registerCommand(registry, 'login', handlerLogin);
registerCommand(registry, 'register', handlerRegister);
registerCommand(registry, 'reset', handlerReset);
registerCommand(registry, 'users', handlerGetUsers);
registerCommand(registry, 'agg', handlerAgg);
registerCommand(registry, 'addfeed', middlewareLoggedIn(handlerAddFeed));
registerCommand(registry, 'feeds', handlerFeeds);
registerCommand(registry, 'follow', middlewareLoggedIn(handlerFollowFeed));
registerCommand(registry, 'following', middlewareLoggedIn(handlerFeedFollowing));
registerCommand(registry, 'unfollow', middlewareLoggedIn(handlerUnfollowFeed));
registerCommand(registry, 'browse', middlewareLoggedIn(handlerBrowse));

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]): Promise<void> => {
        const currentUserName = await getCurrentUser();
        if (!currentUserName) {
            console.log("You must be logged in to use this command");
            return;
        }
        
        const user = await findUserByName(currentUserName);
        if (!user) {
            console.log("User not found. Please log in again");
            return;
        }
        
        await handler(cmdName, user, ...args);
    };
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    await handler(cmdName, ...args);
}
