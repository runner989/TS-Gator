import { setUser } from "../lib/user";
import { findUserByName } from "../lib/db/queries/users";

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (!cmdName || cmdName != 'login') {
        console.log( "Not login command");
        return;
    }
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <username>`);
    }
    const userName = args[0];
    const existingUser = await findUserByName(userName);
    if (!existingUser) {
        throw new Error(`User ${userName} does not exist`);
    }
    setUser(userName);
    console.log("User set to " + userName);
}