import { getUsers } from "../lib/db/queries/users";
import { getCurrentUser } from "../lib/user";
export async function handlerGetUsers(cmdName, ...args) {
    if (!cmdName || cmdName != 'users') {
        console.log("Not users command");
        return;
    }
    const users = await getUsers();
    const currentUser = await getCurrentUser();
    for (let i = 0; i < users.length; i++) {
        if (users[i].name == currentUser) {
            console.log(`* ${users[i].name} (current)`);
        }
        else {
            console.log(`* ${users[i].name}`);
        }
    }
    // console.log(users);
}
