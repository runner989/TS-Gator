import { getCurrentUser } from '../lib/user';
import { findUserByName } from '../lib/db/queries/users';
import { handlerLogin } from './login';
import { handlerRegister } from './register';
import { handlerReset } from './reset';
import { handlerGetUsers } from './getusers';
import { handlerAgg } from './agg';
import { handlerAddFeed, handlerFeeds, handlerFollowFeed, handlerFeedFollowing } from './feeds';
export const registry = {};
registerCommand(registry, 'login', handlerLogin);
registerCommand(registry, 'register', handlerRegister);
registerCommand(registry, 'reset', handlerReset);
registerCommand(registry, 'users', handlerGetUsers);
registerCommand(registry, 'agg', handlerAgg);
registerCommand(registry, 'addfeed', handlerAddFeed);
registerCommand(registry, 'feeds', handlerFeeds);
registerCommand(registry, 'follow', handlerFollowFeed);
registerCommand(registry, 'following', handlerFeedFollowing);
export function middlewareLoggedIn(handler) {
    return async (cmdName, ...args) => {
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
function registerCommand(registry, cmdName, handler) {
    registry[cmdName] = handler;
}
export async function runCommand(registry, cmdName, ...args) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    await handler(cmdName, ...args);
}
