import {readConfig, writeConfig} from "./config";

export function setUser(userName: string) {
    let config = readConfig();
    config.currentUserName = userName;
    writeConfig(config);
}

export async function getCurrentUser() {
    let config = readConfig();
    return config.currentUserName;
}
