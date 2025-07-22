import { setUser } from '../lib/user';
import {createUser, findUserByName} from '../lib/db/queries/users';

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (!cmdName || cmdName != 'register') {
        console.log("Not register command");
        return;
    }
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <username>`);
    }
    const userName = args[0];
    const existingUser = await findUserByName(userName);
    if (existingUser) {
        throw new Error(`User ${userName} already exists`);
    }
    const user = await createUser(userName);
    console.log("User " + userName + " created with id " + user.id);
    setUser(userName);
}