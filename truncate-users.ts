import { truncateUsers } from './src/lib/db/queries/users';

async function main() {
    await truncateUsers();
    console.log('Users table truncated');
    process.exit(0);
}

main().catch(console.error);