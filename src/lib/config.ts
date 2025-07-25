import fs from 'fs';
import path from 'path';
import os from 'os';

type Config = {
    dbUrl: string;
    currentUserName: string;
};

function getConfigFilePath() {
    const configFileName = '.gatorconfig.json';
    const homeDir = os.homedir();
    return path.join(homeDir, configFileName);
}

export function readConfig(){
    const fullPath = getConfigFilePath();
    const data = fs.readFileSync(fullPath, 'utf-8');
    const rawConfig = JSON.parse(data) as Config;
    return validateConfig(rawConfig);

}

function validateConfig(rawConfig: any) {
    if (!rawConfig.db_url || typeof rawConfig.db_url !== 'string') {
        throw new Error('Missing or invalid db_url in config file');
    }
    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name || '',
    };
    return config;
}

export function writeConfig(config: Config) {
    const fullPath = getConfigFilePath();
    const rawConfig = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName,
    };
    const data = JSON.stringify(rawConfig, null, 2);
    fs.writeFileSync(fullPath, data, { encoding: 'utf-8' });
}