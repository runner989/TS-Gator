import { runCommand, registry } from './commands';

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Missing command name. Usage: cli <command> [args...]');
        process.exit(1);
    }
    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    try {
        await runCommand(registry, cmdName, ...cmdArgs);
        
        // Only exit for non-TUI commands and non-long-running commands
        if (cmdName !== 'agg' && !cmdArgs.includes('--tui')) {
            process.exit(0);
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error(`Error running command ${cmdName}: ${err.message}`);
        } else {
            console.error(`Error running command ${cmdName}: ${err}`);
        }
        process.exit(1);
    }
}

main();