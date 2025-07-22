import { truncateUsers } from '../lib/db/queries/users';

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    if (!cmdName || cmdName != 'reset') {
        throw new Error("Not reset command");
    }
    try {
        await truncateUsers();
        console.log('Users table truncated');
    } catch (err) {
        throw new Error(`Error truncating users table: ${err}`);
    }
}